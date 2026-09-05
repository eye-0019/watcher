const { AuditLogEvent } = require("discord.js");
const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");


module.exports = {
    name: "guildBanAdd",

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



        await createLog(ban.guild, {

            type: "moderation",

            action: "Member Banned",


            target: ban.user.id,


            executor: moderator
                ? moderator.id
                : null,


            description:
                `${ban.user.tag} was banned.\nReason: ${reason || "No reason provided"}`,


            severity: "critical",


            logChannel:
                channels.moderation.ban,


            metadata: {

                username: ban.user.tag,

                userId: ban.user.id,

                reason: reason || null

            },


            color: 0xff0000,


            fields: [

                {
                    name: "Moderator",
                    value: moderator
                        ? `${moderator.tag} (${moderator.id})`
                        : "Unknown"
                },

                {
                    name: "User ID",
                    value: ban.user.id
                },

                {
                    name: "Reason",
                    value: reason || "No reason provided"
                }

            ]

        });

    }
};
