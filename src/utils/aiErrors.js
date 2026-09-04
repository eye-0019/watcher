// ============================================================
// Watcher AI Error Manager
// Handles private owner alerts and error reporting
// ============================================================


const OWNER_ID =
    process.env.OWNER_ID ||
    '1443431290492948611';



const AI_ERROR_CHANNEL_ID =
    process.env.AI_ERROR_CHANNEL_ID;



let lastError = null;

let errorCount = 0;



async function sendOwnerError(
    client,
    error,
    details = {}
) {

    lastError = {
        message:
            error?.message || String(error),

        time:
            new Date(),

        model:
            details.model || 'Unknown'
    };


    errorCount++;


    try {

        if (
            !client ||
            !AI_ERROR_CHANNEL_ID
        ) {
            return;
        }



        const channel =
            await client.channels.fetch(
                AI_ERROR_CHANNEL_ID
            );


        if (!channel) {
            return;
        }



        await channel.send(
`
<@${OWNER_ID}>

⚠️ **Watcher AI Error**

**Status:**
🔴 AI Issue Detected

**Type:**
${error?.name || 'Unknown'}

**Reason:**
${error?.message || error}

**Model:**
${details.model || 'Unknown'}

**User:**
${details.username || 'Unknown'}

**Message:**
"${details.message || 'Unknown'}"

**Time:**
${new Date().toLocaleString()}

Watcher attempted recovery.
`
        );


    } catch (sendError) {

        console.error(
            '❌ Failed sending AI error report:',
            sendError
        );

    }

}



function getLastError() {

    return lastError;

}



function getErrorCount() {

    return errorCount;

}



function resetErrors() {

    errorCount = 0;
    lastError = null;

}



module.exports = {

    sendOwnerError,

    getLastError,

    getErrorCount,

    resetErrors

};
