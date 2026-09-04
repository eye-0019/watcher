// ============================================================
// Watcher AI Chat Core
// Main AI handler
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



const MAX_RESPONSE_TOKENS = 150;



async function getAiReply(
    message,
    userMessage,
    client
) {


    const apiKey =
        process.env.OPENROUTER_API_KEY;



    if (!apiKey) {

        const error =
            new Error(
                'Missing OpenRouter API Key'
            );


        await sendOwnerError(
            client,
            error
        );


        return "Something broke on my end. I'll notify the owner and he'll look into it soon. Sorry for the inconvenience.";

    }



    const username =
        message.author.username;


    const userId =
        message.author.id;



    const currentTime =
        new Date()
            .toLocaleString();



    const systemPrompt =
        getPersonalityPrompt(

            username,

            userId,

            userId === process.env.OWNER_ID
                ? 'SERVER OWNER'
                : 'SERVER MEMBER',

            currentTime,

            "Use previous memories if available.",

            "Use recent Discord context when useful."

        );




    const models =
        getModelsToTry();



    let lastError = null;



    for (
        const model of models
    ) {


        const start =
            Date.now();



        try {


            console.log(
                `🤖 Trying model: ${model}`
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

                        method:'POST',

                        headers: {

                            'Content-Type':
                                'application/json',

                            'Authorization':
                                `Bearer ${apiKey}`

                        },


                        signal:
                            controller.signal,


                        body: JSON.stringify({

                            model,

                            messages:[

                                {
                                    role:'system',

                                    content:
                                        systemPrompt
                                },

                                {
                                    role:'user',

                                    content:
                                        userMessage
                                }

                            ],


                            max_tokens:
                                MAX_RESPONSE_TOKENS,


                            temperature:
                                0.65

                        })

                    }

                );



            clearTimeout(timeout);



            if (!response.ok) {

                throw new Error(
                    `${model} failed: ${response.status}`
                );

            }



            const data =
                await response.json();



            const reply =
                data?.choices?.[0]?.message?.content
                    ?.trim();



            if (!reply) {

                throw new Error(
                    `${model} returned empty response`
                );

            }



            const responseTime =
                Date.now() - start;



            recordSuccess(
                responseTime,
                model
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



    await sendOwnerError(

        client,

        lastError || new Error(
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



module.exports = {

    getAiReply

};
