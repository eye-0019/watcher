const { AuditLogEvent } = require("discord.js");
const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");


module.exports = {
    name: "inviteCreate",

    async execute(invite) {

        let executor = null;


        try {
            const logs = await invite.guild.fetchAuditLogs({
                type: AuditLogEvent.InviteCreate,
                limit: 5
            });


            const entry = logs.entries.find(
                e =>
                    e.target?.code === invite.code
            );


            if (entry) {
                executor = entry.executor;
            }

        } catch {}



        await createLog(invite.guild, {

            type: "server",

            action: "Invite Created",


            executor: executor
                ? executor.id
                : null,


            channel: invite.channel
                ? invite.channel.id
                : null,


            description:
                `Invite **${invite.code}** was created.`,


            severity: "normal",


            logChannel: channels.server.invites,


            metadata: {

                code: invite.code,

                maxUses: invite.maxUses,

                expires:
                    invite.expiresAt
                        ? invite.expiresAt.toISOString()
                        : null

            },


            color: 0x57f287,


            fields: [

                {
                    name: "Created By",
                    value: executor
                        ? `${executor.tag} (${executor.id})`
                        : "Unknown"
                },

                {
                    name: "Channel",
                    value: invite.channel
                        ? `<#${invite.channel.id}>`
                        : "Unknown"
                }

            ]

        });

    }
};
