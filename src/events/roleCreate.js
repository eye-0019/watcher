const { AuditLogEvent } = require("discord.js");
const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");


module.exports = {
    name: "roleCreate",

    async execute(role) {

        let executor = null;


        try {
            const logs = await role.guild.fetchAuditLogs({
                type: AuditLogEvent.RoleCreate,
                limit: 5
            });


            const entry = logs.entries.find(
                e => e.target.id === role.id
            );


            if (entry) {
                executor = entry.executor;
            }

        } catch {}



        await createLog(role.guild, {

            type: "server",

            action: "Role Created",


            target: role.id,


            executor: executor
                ? executor.id
                : null,


            description:
                `Role **${role.name}** was created.`,


            severity: "normal",


            logChannel: channels.server.roles,


            metadata: {

                roleId: role.id,

                roleName: role.name,

                color: role.hexColor

            },


            color: 0x57f287,


            fields: [

                {
                    name: "Role ID",
                    value: role.id
                },

                {
                    name: "Position",
                    value: `${role.position}`,
                    inline: true
                },

                {
                    name: "Created By",
                    value: executor
                        ? `${executor.tag} (${executor.id})`
                        : "Unknown"
                }

            ]

        });

    }
};
