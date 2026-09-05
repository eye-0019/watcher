const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");


module.exports = {
    name: "voiceStateUpdate",

    async execute(oldState, newState) {

        const member = newState.member || oldState.member;

        if (!member || member.user.bot) return;


        let action = null;
        let description = null;


        // Joined voice channel
        if (!oldState.channel && newState.channel) {

            action = "Joined Voice Channel";

            description =
                `${member.user.tag} joined **${newState.channel.name}**.`;

        }


        // Left voice channel
        else if (oldState.channel && !newState.channel) {

            action = "Left Voice Channel";

            description =
                `${member.user.tag} left **${oldState.channel.name}**.`;

        }


        // Moved voice channel
        else if (
            oldState.channel &&
            newState.channel &&
            oldState.channel.id !== newState.channel.id
        ) {

            action = "Moved Voice Channel";

            description =
                `${member.user.tag} moved from **${oldState.channel.name}** to **${newState.channel.name}**.`;

        }


        if (!action) return;



        await createLog(newState.guild || oldState.guild, {

            type: "voice",

            action,


            target: member.id,


            channel: newState.channel
                ? newState.channel.id
                : oldState.channel.id,


            description,


            severity: "normal",


            logChannel: channels.voice.update,


            metadata: {

                userId: member.id,

                username: member.user.tag,


                oldChannel:
                    oldState.channel
                        ? oldState.channel.id
                        : null,


                newChannel:
                    newState.channel
                        ? newState.channel.id
                        : null

            },


            color: 0x5865f2

        });

    }
};
