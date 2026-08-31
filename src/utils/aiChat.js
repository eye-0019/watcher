// Sends a message to OpenAI and returns a casual, human-sounding reply.
// Uses Node's built-in fetch (Node 18+), no extra dependency needed.

async function getAiReply(userMessage) {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    if (!apiKey || !userMessage) return null;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: 'system',
                        content: "You're just a regular member hanging out in this Discord server. Talk casually and naturally, like a real person texting — short, relaxed replies, no corporate or robotic tone. Never mention that you're an AI, a bot, or a language model."
                    },
                    { role: 'user', content: userMessage }
                ],
                max_tokens: 300
            })
        });

        if (!response.ok) return null;
        const data = await response.json();
        return data.choices?.[0]?.message?.content?.trim() || null;
    } catch {
        return null;
    }
}

module.exports = { getAiReply };
