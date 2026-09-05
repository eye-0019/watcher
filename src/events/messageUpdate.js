const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");


module.exports = {
    name: "messageUpdate",

    async execute(oldMessage, newMessage) {

        if (!newMessage.guild) return;
        if (newMessage.author?.bot) return;


        // Ignore if content did not change
        if (oldMessage.content === newMessage.content) return;


        await createLog(newMessage.guild, {

            type: "message",

            action: "Message Edited",


            target: newMessage.author
                ? newMessage.author.id
                : null,


            channel: newMessage.channel.id,


            description:
                `A message was edited in <#${newMessage.channel.id}>.`,


            severity: "normal",


            logChannel: channels.messages.edit,


            metadata: {

                author: {
                    id: newMessage.author.id,
                    tag: newMessage.author.tag
                },


                channel: {
                    id: newMessage.channel.id,
                    name: newMessage.channel.name
                },


                before: oldMessage.content || "[Empty]",

                after: newMessage.content || "[Empty]"

            },


            color: 0x3498db,


            fields: [

                {
                    name: "Author",
                    value:
                        `${newMessage.author.tag} (${newMessage.author.id})`
                },

                {
                    name: "Channel",
                    value:
                        `<#${newMessage.channel.id}>`
                },

                {
                    name: "Before",
                    value:
                        oldMessage.content?.slice(0, 1024) || "[Empty]"
                },

                {
                    name: "After",
                    value:
                        newMessage.content?.slice(0, 1024) || "[Empty]"
                }

            ]

        });

    }
};
