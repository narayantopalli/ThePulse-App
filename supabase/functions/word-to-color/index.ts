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

  const systemPrompt = "only give me an array of 4byte RGB decimal integers in order for these words, absolutely no other text";
  const fullPrompt = `${systemPrompt}\n\nWords: ${prompt}`;

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
    const authHeader = req.headers.get('Authorization');
    const token      = authHeader?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return new Response('Missing bearer token', { status: 401 });
    }

    const supabaseClient = createClient(
      Deno.env.get('_SUPABASE_URL') ?? '', 
      token ?? ''
    );
    
    const { data: words, error: wordsError } = await supabaseClient
      .from("words")
      .select("*")
      .is("color_rgb", null);

    if (wordsError) {
      return new Response(
        JSON.stringify({ error: wordsError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!words || words.length === 0) {
      return new Response(
        JSON.stringify({ message: "No words found with null color_rgb", error: wordsError.message }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    let wordData = "";
    let wordIds = [];
    let numWords = 0;
    for (const word of words) {
      wordData += `word ${numWords + 1}: ` + JSON.stringify(word.word) + "\n";
      wordIds.push(word.id);
      numWords++;
    }

    const response = await getResponse(wordData);
    const responseText = response.choices[0].message.content;

    // Extract numbers between square brackets and convert to array
    const match = responseText.match(/\[(.*?)\]/);
    const colors = match ? match[1].split(',').map((num: string) => parseInt(num.trim())) : [];

    // Create an array of updates for each word
    const updates = wordIds.map((id, index) => ({
      id,
      color_rgb: colors[index] || null // Fallback to null if no color is available
    }));

    // Update each word with its corresponding color
    const { error: updateError } = await supabaseClient
      .from("words")
      .upsert(updates, { onConflict: 'id' });

    return new Response(
      JSON.stringify({ error: updateError }),
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
