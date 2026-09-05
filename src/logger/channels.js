module.exports = {
    moderation: {
        ban: process.env.BAN_LOG_CHANNEL,
        kick: process.env.KICK_LOG_CHANNEL,
        warn: process.env.WARN_LOG_CHANNEL,
        timeout: process.env.TIMEOUT_LOG_CHANNEL
    },

    members: {
        join: process.env.JOIN_LOG_CHANNEL,
        leave: process.env.LEAVE_LOG_CHANNEL,
        update: process.env.MEMBER_UPDATE_LOG_CHANNEL
    },

    messages: {
        delete: process.env.MESSAGE_DELETE_LOG_CHANNEL,
        edit: process.env.MESSAGE_EDIT_LOG_CHANNEL
    },

    server: {
        roles: process.env.ROLE_LOG_CHANNEL,
        channels: process.env.CHANNEL_LOG_CHANNEL,
        invites: process.env.INVITE_LOG_CHANNEL
    },

    voice: {
        update: process.env.VOICE_LOG_CHANNEL
    },

    bot: {
        errors: process.env.ERROR_LOG_CHANNEL
    }
};
