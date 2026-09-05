const { AuditLogEvent } = require("discord.js");
const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");


module.exports = {
    name: "channelCreate",

    async execute(channel) {

        if (!channel.guild) return;


        let executor = null;


        try {
            const logs = await channel.guild.fetchAuditLogs({
                type: AuditLogEvent.ChannelCreate,
                limit: 5
            });


            const entry = logs.entries.find(
                e => e.target.id === channel.id
            );


            if (entry) {
                executor = entry.executor;
            }

        } catch {}



        await createLog(channel.guild, {

            type: "server",

            action: "Channel Created",


            target: channel.id,


            executor: executor
                ? executor.id
                : null,


            channel: channel.id,


            description:
                `Channel **#${channel.name}** was created.`,


            severity: "normal",


            logChannel: channels.server.channels,


            metadata: {

                channelId: channel.id,

                name: channel.name,

                type: channel.type

            },


            color: 0x57f287,


            fields: [

                {
                    name: "Channel ID",
                    value: channel.id
                },

                {
                    name: "Type",
                    value: `${channel.type}`,
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
