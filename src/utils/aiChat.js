// ============================================================
// Watcher AI Chat Core v2.1
// Full context + memory + fallback support
// ============================================================


const {
    getModelsToTry
} = require('./aiModels');


const {
    sendOwnerError
} = require('./aiErrors');


const {
    recordSuccess,
    recordFailure
} = require('./aiHealth');


const {
    getPersonalityPrompt
} = require('./aiPersonality');



const {
    getRecentMessages,
    saveMessage,
    getNotes,
    bumpExchangeCount,
    NOTES_UPDATE_EVERY
} = require('./aiMemoryStore');



const MAX_RESPONSE_TOKENS = 250;

const CONTEXT_LIMIT = 15;



// ============================================================
// Load recent Discord messages
// ============================================================

async function getChannelContext(message) {

    try {

        const messages =
            await message.channel.messages.fetch({
                limit: CONTEXT_LIMIT
            });



        return Array
            .from(messages.values())
            .reverse()
            .map(msg => {

                return `${msg.author.username}: ${msg.content}`;

            })
            .join('\n');



    } catch(error) {

        console.error(
            "Failed getting Discord context:",
            error
        );


        return "No recent Discord context.";

    }

}



// ============================================================
// Main AI Function
// ============================================================

async function getAiReply(
    message,
    userMessage,
    client
) {


    const apiKey =
        process.env.OPENROUTER_API_KEY;



    const username =
        message.author.username;


    const userId =
        message.author.id;



    if (!apiKey) {

        const error =
            new Error(
                "Missing OpenRouter API key"
            );


        await sendOwnerError(
            client,
            error,
            {
                username,
                message:userMessage
            }
        );


        return "Something broke on my end. I'll notify the owner and he'll look into it soon. Sorry for the inconvenience.";

    }



    const currentTime =
        new Date()
        .toLocaleString(
            "en-US",
            {
                timeZone:
                    "America/New_York"
            }
        );



    // ========================================================
    // Load memory + context
    // ========================================================


    const memory =
        await getNotes(userId)
        .catch(() => ({
            notes:
            "No saved memories."
        }));



    const previousMessages =
        await getRecentMessages(userId)
        .catch(() => []);



    const discordContext =
        await getChannelContext(
            message
        );



    const userHistory =
        previousMessages
        .slice(-10)
        .map(msg => {

            return `${msg.role}: ${msg.content}`;

        })
        .join('\n');



    const combinedContext = `

RECENT DISCORD CHAT:

${discordContext}


USER HISTORY:

${userHistory}

`;



    const systemPrompt =
        getPersonalityPrompt(

            username,

            userId,

            userId === process.env.OWNER_ID
                ? "SERVER OWNER"
                : "SERVER MEMBER",

            currentTime,

            memory.notes,

            combinedContext

        );
    // ============================================================
// Send request with fallback models
// ============================================================


    const models =
        getModelsToTry();



    let lastError = null;



    for (
        const model of models
    ) {


        const startTime =
            Date.now();



        try {


            console.log(
                `🤖 Trying model: ${model}`
            );



            const controller =
                new AbortController();



            const timeout =
                setTimeout(
                    () => {

                        controller.abort();

                    },

                    30000
                );



            const response =
                await fetch(

                    "https://openrouter.ai/api/v1/chat/completions",

                    {

                        method:
                            "POST",


                        headers:
                        {

                            "Content-Type":
                                "application/json",


                            "Authorization":
                                `Bearer ${apiKey}`,


                            "HTTP-Referer":
                                "https://watcher-bot-iobe.onrender.com",


                            "X-Title":
                                "Watcher Discord Bot"

                        },


                        signal:
                            controller.signal,


                        body:
                            JSON.stringify({

                                model,


                                messages:
                                [

                                    {

                                        role:
                                            "system",

                                        content:
                                            systemPrompt

                                    },


                                    {

                                        role:
                                            "user",

                                        content:
                                            userMessage

                                    }

                                ],



                                max_tokens:
                                    MAX_RESPONSE_TOKENS,



                                temperature:
                                    0.7


                            })

                    }

                );



            clearTimeout(timeout);



            if (
                !response.ok
            ) {

                throw new Error(
                    `${model} failed (${response.status})`
                );

            }



            const data =
                await response.json();



            const reply =
                data
                ?.choices
                ?.[0]
                ?.message
                ?.content
                ?.trim();



            if (
                !reply
            ) {

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
                `✅ AI reply generated using ${model} (${responseTime}ms)`
            );



            return reply;



        } catch(error) {


            console.error(
                `❌ ${model} failed:`,
                error.message
            );



            recordFailure();



            lastError =
                error;


        }

    }
    // ============================================================
// Handle complete failure
// ============================================================


    await sendOwnerError(

        client,

        lastError ||
            new Error(
                "All AI models failed"
            ),

        {

            model:
                models.join(", "),

            username,

            message:
                userMessage

        }

    );



    return "Something broke on my end. I'll notify the owner and he'll look into it soon. Sorry for the inconvenience.";

}



// ============================================================
// Save AI conversation
// ============================================================


async function saveConversation(

    userId,

    userMessage,

    reply

) {


    try {


        await saveMessage(

            userId,

            "user",

            userMessage

        );



        await saveMessage(

            userId,

            "assistant",

            reply

        );



        const count =
            await bumpExchangeCount(
                userId
            );



        if (
            count >= NOTES_UPDATE_EVERY
        ) {

            console.log(
                `🧠 Memory update needed for ${userId}`
            );

        }



    } catch(error) {


        console.error(
            "Failed saving conversation:",
            error
        );


    }

}



// ============================================================
// Export
// ============================================================


module.exports = {

    getAiReply,

    saveConversation

};
