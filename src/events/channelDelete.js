const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");

module.exports = {
    name: "channelDelete",

    async execute(channel) {

        if (!channel.guild) return;


        await createLog(channel.guild, {

            type: "channel",

            action: "Channel Deleted",

            target: channel.id,

            executor: null,


            description:
                `Channel deleted: ${channel.name}`,


            severity: "warning",


            logChannel:
                channels.channels.delete,


            metadata: {

                channelName: channel.name,

                channelId: channel.id,

                type: channel.type

            },


            color: 0xff0000,


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
