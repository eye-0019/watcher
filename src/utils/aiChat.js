// ============================================================
// AI Chat
// ============================================================

async function getAiReply(userMessage) {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    if (!apiKey) {
        console.error('❌ OPENAI_API_KEY is missing.');
        return null;
    }

    if (!userMessage) {
        console.warn('⚠️ AI received an empty message.');
        return null;
    }

    try {
        console.log(`🤖 Sending AI request using model: ${model}`);

        const response = await fetch(
            'https://api.openai.com/v1/chat/completions',
            {
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
                            content:
                                "You're just a regular member hanging out in this Discord server. Talk casually and naturally, like a real person texting — short, relaxed replies, no corporate or robotic tone. Never mention that you're an AI, a bot, or a language model."
                        },
                        {
                            role: 'user',
                            content: userMessage
                        }
                    ],
                    max_tokens: 300
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();

            console.error(
                `❌ OpenAI API error (${response.status}):`,
                errorText
            );

            return null;
        }

        const data = await response.json();

        const reply = data.choices?.[0]?.message?.content?.trim();

        if (!reply) {
            console.error('❌ OpenAI returned no message:', data);
            return null;
        }

        console.log('✅ AI reply generated.');

        return reply;
    } catch (error) {
        console.error('❌ AI request failed:', error);
        return null;
    }
}

module.exports = { getAiReply };

