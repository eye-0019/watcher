const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");


module.exports = {
    name: "guildMemberAdd",

    async execute(member) {

        await createLog(member.guild, {

            type: "member",

            action: "Member Joined",


            target: member.id,


            description:
                `${member.user.tag} joined the server.`,


            severity: "normal",


            logChannel: channels.members.join,


            metadata: {
                username: member.user.tag,
                userId: member.id,
                accountCreated: member.user.createdAt
            },


            color: 0x00ff99,


            fields: [
                {
                    name: "Account Created",
                    value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`
                },
                {
                    name: "Member Count",
                    value: `${member.guild.memberCount}`,
                    inline: true
                }
            ]

        });

    }
};
