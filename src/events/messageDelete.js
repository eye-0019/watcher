const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");


module.exports = {
    name: "messageDelete",

    async execute(message) {

        // Ignore bots and uncached messages
        if (!message.guild) return;
        if (message.author?.bot) return;


        await createLog(message.guild, {

            type: "message",

            action: "Message Deleted",


            target: message.author
                ? message.author.id
                : null,


            channel: message.channel.id,


            description:
                `A message was deleted in <#${message.channel.id}>.`,


            severity: "normal",


            logChannel: channels.messages.delete,


            metadata: {

                author: message.author
                    ? {
                        id: message.author.id,
                        tag: message.author.tag
                    }
                    : null,


                channel: {
                    id: message.channel.id,
                    name: message.channel.name
                },


                content: message.content || "[No content stored]",


                attachments:
                    [...message.attachments.values()]
                        .map(file => file.url)

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
                }

            ]

        });

    }
};
