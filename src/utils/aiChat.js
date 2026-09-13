// ============================================================
// Watcher AI Chat Core v4.0
// Full server awareness + categorized memory
// ============================================================

const { getModelsToTry } = require('./aiModels');
const { sendOwnerError } = require('./aiErrors');
const { recordSuccess, recordFailure } = require('./aiHealth');
const { getPersonalityPrompt } = require('./aiPersonality');
const { buildServerContext } = require('./aiContext');

const {
    getRecentMessages,
    saveMessage,
    getNotes,
    bumpExchangeCount,
    updateMemory,
    NOTES_UPDATE_EVERY
} = require('./aiMemoryStore');


const MAX_RESPONSE_TOKENS = 300;
const CONTEXT_LIMIT = 15;


// ============================================================
// Channel context
// ============================================================

async function getChannelContext(message) {

    try {

        const messages =
            await message.channel.messages.fetch({
                limit: CONTEXT_LIMIT
            });


        return Array.from(messages.values())
            .reverse()
            .map(msg =>
                `${msg.author.username}: ${msg.content}`
            )
            .join('\n');


    } catch (error) {

        console.error(
            'Failed getting Discord context:',
            error
        );

        return 'No recent channel context.';
    }
}


// ============================================================
// Categorize memory
// ============================================================

function categorizeMemory(message) {

    const text =
        message.toLowerCase();


    if (
        text.includes('i like') ||
        text.includes('i love') ||
        text.includes('favorite') ||
        text.includes('i enjoy')
    ) {

        return {
            personality: {
                preference: message
            },
            importance: 2
        };

    }


    if (
        text.includes('building') ||
        text.includes('coding') ||
        text.includes('working on') ||
        text.includes('project') ||
        text.includes('making')
    ) {

        return {
            projects: {
                project: message
            },
            importance: 3
        };

    }


    return {

        profile: {
            info: message
        },

        importance: 1
    };
}


// ============================================================
// Main AI
// ============================================================

async function getAiReply(
    message,
    userMessage,
    client
) {


    const apiKey =
        process.env.OPENROUTER_API_KEY;


    console.log(
        "API KEY LOADED:",
        apiKey ? "YES" : "NO"
    );


    const username =
        message.author.username;


    const userId =
        message.author.id;



    if (!apiKey) {

        const error =
            new Error(
                'Missing OpenRouter API key'
            );


        await sendOwnerError(
            client,
            error,
            {
                username,
                message: userMessage
            }
        );


        return "Something broke on my end. I'll notify the owner and he'll look into it soon. Sorry for the inconvenience.";
    }



    const currentTime =
        new Date().toLocaleString(
            'en-US',
            {
                timeZone:
                    'America/New_York'
            }
        );



    const [
        memory,
        previousMessages,
        discordContext,
        serverContext

    ] = await Promise.all([


        getNotes(userId)
            .catch(() => ({
                notes: null,
                profile: {},
                personality: {},
                projects: {},
                importance: 0
            })),


        getRecentMessages(userId)
            .catch(() => []),


        getChannelContext(message),


        buildServerContext(message)
            .catch(() =>
                'Server context unavailable.'
            )

    ]);



    const userHistory =
        previousMessages
            .slice(-10)
            .map(msg =>
                `${msg.role}: ${msg.content}`
            )
            .join('\n');



    const combinedConversation = `

RECENT CHANNEL MESSAGES:
${discordContext}


USER HISTORY:
${userHistory}

`.trim();



    const systemPrompt =
        getPersonalityPrompt(

            username,

            userId,

            userId === process.env.OWNER_ID
                ? 'SERVER OWNER'
                : 'SERVER MEMBER',

            currentTime,


            JSON.stringify({

                profile:
                    memory.profile,

                personality:
                    memory.personality,

                projects:
                    memory.projects,

                importance:
                    memory.importance

            }),


            combinedConversation,

            serverContext
        );



    const models =
        getModelsToTry();


    let lastError = null;



    for (const model of models) {


        const startTime =
            Date.now();


        try {


            console.log(
                `Trying model: ${model}`
            );



            const controller =
                new AbortController();



            const timeout =
                setTimeout(
                    () =>
                        controller.abort(),
                    30000
                );



            const response =
                await fetch(
                    'https://openrouter.ai/api/v1/chat/completions',
                    {

                        method: 'POST',

                        headers: {

                            'Content-Type':
                                'application/json',

                            'Authorization':
                                `Bearer ${apiKey}`,

                            'HTTP-Referer':
                                'https://watcher-bot-iobe.onrender.com',

                            'X-Title':
                                'Watcher Discord Bot'
                        },


                        signal:
                            controller.signal,


                        body:
                            JSON.stringify({

                                model,


                                messages: [

                                    {
                                        role:
                                            'system',

                                        content:
                                            systemPrompt
                                    },


                                    {
                                        role:
                                            'user',

                                        content:
                                            userMessage
                                    }

                                ],


                                max_tokens:
                                    MAX_RESPONSE_TOKENS,


                                temperature:
                                    0.85

                            })

                    }
                );



            clearTimeout(timeout);



            if (!response.ok) {

                throw new Error(
                    `${model} failed (${response.status})`
                );

            }



            const data =
                await response.json();



            const reply =
                data?.choices?.[0]
                    ?.message
                    ?.content
                    ?.trim();



            if (!reply) {

                throw new Error(
                    `${model} returned empty response`
                );

            }



            const responseTime =
                Date.now() - startTime;



            recordSuccess(
                responseTime,
                model
            );


            console.log(
                `AI reply via ${model} (${responseTime}ms)`
            );



            return reply;



        } catch(error) {


            console.error(
                '❌ AI MODEL FAILED'
            );


            console.error(
                'Model:',
                model
            );


            console.error(
                'Reason:',
                error.message
            );



            recordFailure();


            lastError =
                error;

        }

    }



    await sendOwnerError(

        client,

        lastError ||
            new Error(
                'All AI models failed'
            ),


        {
            model:
                models.join(', '),

            username,

            message:
                userMessage
        }

    );



    return "Something broke on my end. I'll notify the owner and he'll look into it soon. Sorry for the inconvenience.";
}



// ============================================================
// Save conversation + memory
// ============================================================

async function saveConversation(
    userId,
    userMessage,
    reply
) {


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



        const count =
            await bumpExchangeCount(userId);



        if (
            count >= NOTES_UPDATE_EVERY &&
            count % NOTES_UPDATE_EVERY === 0
        ) {


            console.log(
                `Memory update needed for ${userId}`
            );



            const memory =
                categorizeMemory(
                    userMessage
                );



            await updateMemory(
                userId,
                memory
            );



            console.log(
                `Memory saved for ${userId}`
            );

        }



    } catch(error) {


        console.error(
            'Failed saving conversation:',
            error
        );

    }

}



module.exports = {
    getAiReply,
    saveConversation
};