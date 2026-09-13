const { AuditLogEvent } = require("discord.js");
const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");


module.exports = {
    name: "inviteCreate",

    async execute(invite) {

        console.log(
            `[INVITE CREATE] ${invite.code} created in ${invite.guild.name}`
        );


        let executor = null;


        try {

            const logs = await invite.guild.fetchAuditLogs({
                type: AuditLogEvent.InviteCreate,
                limit: 5
            });


            const entry = logs.entries.find(
                e => e.target?.code === invite.code
            );


            if (entry) {
                executor = entry.executor;
            }


        } catch (err) {

            console.error(
                "[inviteCreate] Audit log error:",
                err.message
            );

        }



        await createLog(invite.guild, {

            type: "server",

            action: "Invite Created",

            target: null,

            executor: executor
                ? executor.id
                : null,


            channel: invite.channel
                ? invite.channel.id
                : null,


            description:
                `Invite \`${invite.code}\` was created.`,


            severity: "normal",


            logChannel:
                channels.invites?.create,


            metadata: {

                code: invite.code,

                inviter:
                    invite.inviter
                    ? invite.inviter.id
                    : null,

                maxUses:
                    invite.maxUses,

                temporary:
                    invite.temporary,

                expires:
                    invite.expiresAt
                    ? invite.expiresAt.toISOString()
                    : null

            },


            color: 0x57f287,


            fields: [

                {
                    name: "Created By",

                    value:
                        executor
                        ? `${executor.tag} (${executor.id})`
                        : "Unknown"
                },


                {
                    name: "Invite Code",

                    value:
                        `\`${invite.code}\``
                },


                {
                    name: "Channel",

                    value:
                        invite.channel
                        ? `<#${invite.channel.id}>`
                        : "Unknown"
                }

            ]

        }).catch(err => {

            console.error(
                "[inviteCreate] Logging failed:",
                err
            );

        });

    }
};