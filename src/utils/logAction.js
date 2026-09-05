const { createLog } = require("../logger/logger");
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

    let logChannel = null;


    if (type === "moderation") {
        logChannel = channels.moderation.ban;
    }

    else if (type === "member") {
        logChannel = channels.members.update;
    }

    else if (type === "message") {
        logChannel = channels.messages.edit;
    }

    else if (type === "role") {
        logChannel = channels.roles.create;
    }

    else if (type === "channel") {
        logChannel = channels.channels.create;
    }

    else if (type === "voice") {
        logChannel = channels.voice.update;
    }

    else {
        logChannel = channels.system;
    }


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

        logChannel

    });

}


module.exports = {
    logAction
};
