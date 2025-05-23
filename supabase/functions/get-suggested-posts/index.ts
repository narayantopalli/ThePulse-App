// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// deno run --allow-env --allow-net get‑suggested‑posts.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.46.1";

type Post = {
  id: string;
  user_id: string;
  data: { post_data: unknown; image_url?: string };
  created_at: string;
  popularity_score: number;
  location_string: string;
};

const LIKE   = 0.3;
const STATUS = 3.0;
const POLL   = 0.4;
const RESP   = 0.8;
const WEEK_MS = 1000 * 60 * 60 * 24 * 7;

const POP_W               = 0.45;   // pure popularity
const AFF_W               = 0.95;   // author affinity
const REC_W               = 0.15;   // freshness
const TREND_W             = 0.70;   // popularity * freshness “trend” bump
const POPULARITY_SCALING = 3.0;
const RECENCY_SCALING = 4.0;

function orderPosts(
  posts: Post[],
  likeRows: any[],
  statusRows: any[],
  pollRows: any[],
  responseRows: any[]
) {
  const now = Date.now();
  const activity =
    likeRows.length + statusRows.length + pollRows.length + responseRows.length;

  return posts
    .map(p => {
      const alreadyLiked = likeRows.some(l => l.post_id === p.id);
      const alreadyPolled = pollRows.some(po => po.post_id === p.id);
      const alreadyResponded = responseRows.some(r => r.post_id === p.id);
      
      const interactedAlready = (alreadyLiked || alreadyPolled || alreadyResponded)

      const authorScore =
        (likeRows.filter(l => l.poster?.user_id === p.user_id).length)*LIKE +
        (statusRows.filter(s => s.status_id === p.id).length)*STATUS +
        (pollRows.filter(po => po.poster?.user_id === p.user_id).length)*POLL +
        (responseRows.filter(r => r.poster?.user_id === p.user_id).length)*RESP;

      const activityFactor = 1 - Math.exp(-activity / 10);

      const affinity = 1 - Math.exp(-authorScore);
      const popularity = 1 - Math.exp(-p.popularity_score / POPULARITY_SCALING);

      const ageMs = now - new Date(p.created_at).getTime()
      const recency = Math.exp(-RECENCY_SCALING * ageMs / WEEK_MS)

      // if they are very active, we want to show them more recent posts
      // if they are not active, we want to show them posts that they will likely interact with
      const score = (1-activityFactor) * (POP_W * popularity + AFF_W * affinity) + activityFactor * (REC_W * recency + TREND_W * popularity * recency)

      return {
        ...p,
        _score: score,
        _interactedAlready: interactedAlready
      };
    })
    .sort((a, b) => {
      if (a._interactedAlready && !b._interactedAlready) return 1;
      if (!a._interactedAlready && b._interactedAlready) return -1;
      return b._score - a._score;
    });
}

/* ---------- edge function ------------------------------------------------ */

Deno.serve(async (req: Request) => {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Missing bearer token", { status: 401 });
    }

    /* ---- create a client that sends that token on every request ---- */
    const supabase = createClient(
      Deno.env.get("_SUPABASE_URL")!,
      Deno.env.get("_SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: authHeader } }
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return new Response("Unauthenticated", { status: 401 });

    const {
      currentFeed = [],
      location,
      searchRadius,
      blockedPosts = [],
      numPostsToAdd
    } = await req.json();

    if (!location) throw new Error("location missing");
    if (typeof searchRadius !== "number" || searchRadius <= 0)
      throw new Error("searchRadius must be > 0");
    if (typeof numPostsToAdd !== "number" || numPostsToAdd <= 0)
      throw new Error("numPostsToAdd must be > 0");

    /* -------- get candidate posts in one RPC --------------------------- */
    const { data: posts, error: postsErr } = await supabase.rpc("get_posts", {
      p_lon: location.longitude,
      p_lat: location.latitude,
      p_rad: searchRadius
    });
    if (postsErr) throw postsErr;

    const visiblePosts: Post[] = posts.filter(
      (p: Post) => !blockedPosts.includes(p.id) && p.user_id !== user.id && !currentFeed.some((post: Post) => post.id === p.id)
    );

    /* -------- four lightweight selects in parallel -------------------- */
    const { data: likeRows, error: likeErr } = await supabase.from("likes").select("post_id, poster:posts!likes_post_id_fkey(user_id)").eq("user_id", user.id);
    const { data: statusRows, error: statusErr } = await supabase.from("status_likes").select("status_id").eq("user_id", user.id);
    const { data: pollRows, error: pollErr } = await supabase.from("poll_votes").select("post_id, poster:posts!polls_post_id_fkey(user_id)").eq("user_id", user.id);
    const { data: responseRows, error: responseErr } = await supabase.from("responses").select("post_id, poster:posts!responses_post_id_fkey(user_id)").eq("user_id", user.id);
    if (likeErr || statusErr || pollErr || responseErr) {
      throw likeErr ?? statusErr ?? pollErr ?? responseErr!;
    }

    const orderedWithScores = orderPosts(
      visiblePosts,
      likeRows,
      statusRows,
      pollRows,
      responseRows
    ).slice(0, numPostsToAdd);

    const ordered = orderedWithScores.map(({ _score, _interactedAlready, ...clean }) => clean);

    /* -------- profile lookup (only the authors we need) --------------- */
    const authorIds = [...new Set(ordered.map(p => p.user_id))];
    const { data: profiles, error: profileErr } = await supabase
      .from("profiles")
      .select("id, avatar_url, firstname, lastname")
      .in("id", authorIds);
    if (profileErr) throw profileErr;

    const newFeed = ordered.map(p => {
      const userData = profiles?.find((u: { id: string }) => u.id === p.user_id) ?? null;
      return {
        ...p,
        user_data: userData
      };
    });

    return new Response(JSON.stringify({ newFeed, user }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-suggested-posts' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
