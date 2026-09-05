const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");

module.exports = {
    name: "channelCreate",

    async execute(channel) {

        if (!channel.guild) return;

        await createLog(channel.guild, {

            type: "channel",

            action: "Channel Created",

            target: channel.id,

            executor: null,

            description:
                `Channel created: ${channel.name}`,

            severity: "normal",

            logChannel:
                channels.channels.create,

            metadata: {

                channelName: channel.name,

                channelId: channel.id,

                type: channel.type

            },

            color: 0x00ff00,


            fields: [

                {
                    name: "Channel",
                    value: `${channel.name} (${channel.id})`
                },

                {
                    name: "Type",
                    value: `${channel.type}`
                }

            ]

        });

    }
};
