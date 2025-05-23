// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2.46.1";

async function getResponse(prompt: string) {
  const apiKey = Deno.env.get('_GEMINI_API_KEY');
  
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const systemPrompt = "You are an old irish man. Give the user a vague summary of the feed. Strictly keep it under 25 words.";
  const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: fullPrompt
        }]
      }]
    }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Gemini API error: ${response.status} ${error.error?.message || response.statusText}`);
  }
  
  const data = await response.json();
  return {
    choices: [{
      message: {
        content: data.candidates[0].content.parts[0].text
      }
    }]
  };
}

Deno.serve(async (req: Request) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('_SUPABASE_URL') ?? '',
      Deno.env.get('_SUPABASE_ANON_KEY') ?? '',
    )

    // Get the session or user object
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data } = await supabaseClient.auth.getUser(token)
    const user = data.user

    const { feed } = await req.json();
    
    if (!Array.isArray(feed)) {
      throw new Error('Feed must be an array');
    }

    let postData = "";
    let numPosts = 0;
    for (const post of feed) {
      postData += `post ${numPosts + 1}: ` + JSON.stringify(post.data.post_data) + " created at: " + post.created_at + " near: " + post.location_string + " likes: " + post.popularity_score + "\n";
      numPosts++;
    }

    const response = await getResponse(postData);
    const responseText = response.choices[0].message.content;
    
    return new Response(
      JSON.stringify({ message: responseText, user }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" } 
      },
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Set the GEMINI_API_KEY environment variable
  3. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/aichat' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"feed":[{"data":{"post_data":{"title":"Test Post"}},"created_at":"2024-01-01","location_string":"Dublin","popularity_score":10}]}'

*/
