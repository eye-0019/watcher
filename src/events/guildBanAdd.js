const { AuditLogEvent } = require('discord.js');
const { logAction } = require('../utils/logAction');

module.exports = {
    name: 'guildBanAdd',

    async execute(ban) {
        let moderator = null;
        let reason = null;

        try {
            const auditLogs = await ban.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberBanAdd,
                limit: 5
            });

            const entry = auditLogs.entries.find(
                e => e.target.id === ban.user.id
            );

            if (entry) {
                moderator = entry.executor;
                reason = entry.reason;
            }

        } catch {}

        if (moderator && moderator.bot) return;


        await logAction(ban.guild, {
            eventType: "moderation",
            action: "Ban",

            moderator: moderator || "Unknown",
            target: ban.user,

            reason: reason || "No reason provided",

            severity: "high",

            metadata: {
                username: ban.user.tag,
                userId: ban.user.id
            },

            color: 0xFF0000
        });
    }
};
