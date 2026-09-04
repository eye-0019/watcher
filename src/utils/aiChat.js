// ============================================================
// Watcher AI Chat
// ============================================================

const {
    getRecentMessages,
    saveMessage,
    getNotes,
    bumpExchangeCount,
    saveNotes,
    NOTES_UPDATE_EVERY
} = require('./aiMemoryStore');


// ============================================================
// Configuration
// ============================================================

const OWNER_ID = process.env.OWNER_ID || '1443431290492948611';

const DEFAULT_MODEL =
    process.env.OPENROUTER_MODEL ||
    'qwen/qwen3.7-flash';

const MAX_RESPONSE_TOKENS = 150;

// Number of recent Discord messages Watcher can look at
const CHANNEL_CONTEXT_LIMIT = 8;


// ============================================================
// Get recent Discord channel conversation
// ============================================================

async function getRecentChannelContext(message) {
    try {
        if (
            !message?.channel ||
            !message.channel.messages
        ) {
            return [];
        }

        const messages =
            await message.channel.messages.fetch({
                limit: CHANNEL_CONTEXT_LIMIT
            });

        return Array.from(messages.values())
            .reverse()
            .filter(m => !m.author.bot)
            .map(m => ({
                username:
                    m.author?.username ||
                    'Unknown User',

                content:
                    m.content?.trim() ||
                    '[attachment or non-text message]'
            }))
            .filter(m => m.content)
            .slice(-CHANNEL_CONTEXT_LIMIT);

    } catch (error) {
        console.error(
            '❌ Failed to fetch recent channel context:',
            error
        );

        return [];
    }
}


// ============================================================
// Banned content filter
// ============================================================

const BANNED_PHRASES = [
    'go touch grass',
    'touch grass'
];

const BANNED_EMOJIS = ['💅', '🤢', '🤮'];

const WORD_SYNONYMS = {
    'unhinged': ['wild', 'unwell', 'not okay', 'cooked', 'a lot']
};

function pickSynonym(word) {
    const options = WORD_SYNONYMS[word.toLowerCase()];
    return options[Math.floor(Math.random() * options.length)];
}

function replaceBannedWords(text) {
    let result = text;

    for (const word of Object.keys(WORD_SYNONYMS)) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');

        result = result.replace(regex, () => pickSynonym(word));
    }

    return result;
}

function sanitizeReply(text) {
    if (!text) return text;

    let cleaned = text;

    for (const emoji of BANNED_EMOJIS) {
        cleaned = cleaned.split(emoji).join('');
    }

    cleaned = replaceBannedWords(cleaned);

    return cleaned.trim();
}
// ========================================================
// Main AI reply function
// ========================================================

async function getAiReply(message, userMessage, client) {

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = DEFAULT_MODEL;
    const logChannelId = process.env.LOG_CHANNEL_ID;

    // Helper to send logs to Discord instead of console
    async function sendLog(content) {
        if (!client || !logChannelId) {
            console.log(content);
            return;
        }

        try {
            const logChannel = await client.channels.fetch(logChannelId);

            if (logChannel?.isTextBased()) {
                await logChannel.send(content).catch(() => console.log(content));
            } else {
                console.log(content);
            }

        } catch {
            console.log(content);
        }
    }

    if (!apiKey) {
        console.error(
            '❌ OPENROUTER_API_KEY is missing.'
        );

        return null;
    }

    if (
        !message ||
        !userMessage ||
        !userMessage.trim()
    ) {
        console.warn(
            '⚠️ AI received an empty message.'
        );

        return null;
    }


    // ========================================================
    // Identify user
    // ========================================================

    const userId =
        message.author?.id ||
        'Unknown User';

    const username =
        message.author?.username ||
        'Unknown User';

    const isOwner =
        userId === OWNER_ID;

    const userStatus =
        isOwner
            ? 'SERVER OWNER'
            : 'SERVER MEMBER';


    // ========================================================
    // Load relationship memory
    // ========================================================

    const userMemory =
        await getNotes(userId)
            .catch(() => ({
                notes: null,
                exchange_count: 0
            }));

    const notes =
        userMemory?.notes ||
        null;


    const recentMessages =
        await getRecentMessages(userId)
            .catch(() => []);


    // ========================================================
    // Load recent Discord conversation
    // ========================================================

    const channelContext =
        await getRecentChannelContext(message);


    const relationshipMemory =
        notes
            ? notes
            : 'No permanent relationship notes yet.';


    let channelConversation =
        'No recent channel conversation was available.';


    if (channelContext.length) {

        channelConversation =
            channelContext
                .map(m =>
                    `${m.username}: ${m.content}`
                )
                .join('\n');
    }
    // ========================================================
// Build AI prompt
// ========================================================

const systemPrompt = `
You are Watcher AI, a Discord server assistant.

Current user:
${username}

User status:
${userStatus}

Rules:
- Be helpful.
- Be concise when possible.
- Do not mention internal systems.
- Do not reveal private data.
- Follow server rules.

User relationship memory:
${relationshipMemory}

Recent user messages:
${recentMessages
    .map(m =>
        `${m.role}: ${m.content}`
    )
    .join('\n') || 'None'}

Recent channel conversation:
${channelConversation}
`;


// ========================================================
// Send request to OpenRouter
// ========================================================

try {

    const response =
        await fetch(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                method: 'POST',

                headers: {
                    Authorization:
                        `Bearer ${apiKey}`,

                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({

                    model,

                    max_tokens:
                        MAX_RESPONSE_TOKENS,

                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        {
                            role: 'user',
                            content: userMessage
                        }
                    ]
                })
            }
        );


    const data =
        await response.json();



    if (!response.ok) {

        console.error(
            '❌ OpenRouter API error:',
            data
        );

        return null;
    }



    // ====================================================
    // Removed:
    // - OpenRouter usage token logs
    // - cost logs
    // - model request logs
    //
    // They were only Discord spam.
    // ====================================================



    const reply =
        data?.choices?.[0]?.message?.content
        ?.trim();



    if (!reply) {

        console.warn(
            '⚠️ AI returned no content.'
        );

        return null;
    }


    return sanitizeReply(reply);


} catch (error) {

    console.error(
        '❌ OpenRouter request failed:',
        error
    );

    return null;
}// ========================================================
// Save AI conversation memory
// ========================================================

async function saveAiMemory(userId, userMessage, reply) {

    try {

        await saveMessage(
            userId,
            'user',
            userMessage
        );


        await saveMessage(
            userId,
            'assistant',
            reply
        );


        const exchangeCount =
            await bumpExchangeCount(userId)
                .catch(() => 0);



        if (
            exchangeCount &&
            exchangeCount % NOTES_UPDATE_EVERY === 0
        ) {

            await saveNotes(
                userId,
                reply
            );
        }


    } catch (error) {

        console.error(
            '❌ Failed saving AI memory:',
            error
        );
    }
}



// ========================================================
// Export
// ========================================================

module.exports = {
    getAiReply,
    saveAiMemory,
    sanitizeReply
};
