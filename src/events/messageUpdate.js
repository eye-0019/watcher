const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");

module.exports = {
    name: "messageUpdate",

    async execute(oldMessage, newMessage) {

        if (!newMessage.guild) return;
        if (newMessage.author?.bot) return;

        if (oldMessage.content === newMessage.content) return;


        await createLog(newMessage.guild, {

            type: "message",

            action: "Message Edited",

            target: newMessage.author
                ? newMessage.author.id
                : null,


            executor: null,


            description:
                `${newMessage.author ? newMessage.author.tag : "Unknown user"} edited a message`,


            severity: "normal",


            logChannel:
                channels.messages.edit,


            metadata: {

                author: newMessage.author
                    ? newMessage.author.tag
                    : null,

                authorId: newMessage.author
                    ? newMessage.author.id
                    : null,

                channelId: newMessage.channel.id,

                oldContent:
                    oldMessage.content || "[Empty]",

                newContent:
                    newMessage.content || "[Empty]"

            },


            color: 0xffff00,


            fields: [

                {
                    name: "Author",
                    value: newMessage.author
                        ? `${newMessage.author.tag} (${newMessage.author.id})`
                        : "Unknown"
                },

                {
                    name: "Channel",
                    value: `<#${newMessage.channel.id}>`
                },

                {
                    name: "Before",
                    value: oldMessage.content
                        ? oldMessage.content.slice(0, 1024)
                        : "[Empty]"
                },

                {
                    name: "After",
                    value: newMessage.content
                        ? newMessage.content.slice(0, 1024)
                        : "[Empty]"
                }

            ]

        });

    }
};
