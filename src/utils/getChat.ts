import Constants from "expo-constants";


async function getResponse(prompt: string) {
    const apiKey = Constants.expoConfig?.extra?.GeminiApiKey;
    
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

export const getChat = async ({ feed, setIsFetching }: { feed: any[], setIsFetching: (isFetching: boolean) => void }): Promise<string> => {
    let postData = "";
    let numPosts = 0;
    for (const post of feed) {
        postData += `post ${numPosts + 1}: ` + JSON.stringify(post.data.post_data) + " created at: " + post.created_at + " near: " + post.location_string + "\n";
        numPosts++;
    }
    try {
        const response = await getResponse(postData);
        setIsFetching(false);
        const responseText = response.choices[0].message.content;
        console.log("Gemini response:", responseText);
        return responseText;
    } catch (error) {
        console.log('Error calling Gemini API:', error);
        return "";
    }
}
