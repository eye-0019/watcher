const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");

module.exports = {
    name: "messageDelete",

    async execute(message) {

        if (!message.guild) return;
        if (message.author?.bot) return;


        await createLog(message.guild, {

            type: "message",

            action: "Message Deleted",

            target: message.author
                ? message.author.id
                : null,


            executor: null,


            description:
                `${message.author ? message.author.tag : "Unknown user"}'s message was deleted`,


            severity: "normal",


            logChannel:
                channels.messages.delete,


            metadata: {

                author: message.author
                    ? message.author.tag
                    : null,

                authorId: message.author
                    ? message.author.id
                    : null,

                channelId: message.channel.id,

                content: message.content || "[No content cached]"

            },


            color: 0xff9900,


            fields: [

                {
                    name: "Author",
                    value: message.author
                        ? `${message.author.tag} (${message.author.id})`
                        : "Unknown"
                },

                {
                    name: "Channel",
                    value: `<#${message.channel.id}>`
                },

                {
                    name: "Content",
                    value: message.content
                        ? message.content.slice(0, 1024)
                        : "[No content cached]"
                }

            ]

        });

    }
};
