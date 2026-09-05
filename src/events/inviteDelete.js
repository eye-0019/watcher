const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");


module.exports = {
    name: "inviteDelete",

    async execute(invite) {

        if (!invite.guild) return;


        await createLog(invite.guild, {

            type: "server",

            action: "Invite Deleted",


            channel: invite.channel
                ? invite.channel.id
                : null,


            description:
                `Invite **${invite.code}** was deleted.`,


            severity: "normal",


            logChannel: channels.server.invites,


            metadata: {

                code: invite.code,

                channelId:
                    invite.channel
                        ? invite.channel.id
                        : null

            },


            color: 0xff9900,


            fields: [

                {
                    name: "Invite Code",
                    value: invite.code
                },

                {
                    name: "Channel",
                    value:
                        invite.channel
                            ? `<#${invite.channel.id}>`
                            : "Unknown"
                }

            ]

        });

    }
};
