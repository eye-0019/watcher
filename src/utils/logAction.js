const { createLog } = require("./logger");
const channels = require("../logger/channels");


async function logAction(guild, {
    type = "system",
    action,
    target = null,
    executor = null,
    description = "",
    severity = "normal",
    metadata = {},
    color = 0xffffff,
    fields = []
}) {

    await createLog(guild, {

        type,

        action,

        target,

        executor,

        description,

        severity,

        metadata,

        color,

        fields,

        logChannel:
            channels[type]?.default ||
            channels.system

    });

}


module.exports = {
    logAction
};
