
const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");

module.exports = {
    name: "voiceStateUpdate",

    async execute(oldState, newState) {

        const member = newState.member || oldState.member;

        if (!member) return;


        let action = null;
        let description = null;


        if (!oldState.channelId && newState.channelId) {

            action = "Voice Joined";

            description =
                `${member.user.tag} joined ${newState.channel.name}`;

        }


        else if (oldState.channelId && !newState.channelId) {

            action = "Voice Left";

            description =
                `${member.user.tag} left ${oldState.channel.name}`;

        }


        else if (
            oldState.channelId &&
            newState.channelId &&
            oldState.channelId !== newState.channelId
        ) {

            action = "Voice Moved";

            description =
                `${member.user.tag} moved from ${oldState.channel.name} to ${newState.channel.name}`;

        }


        else {

            return;

        }



        await createLog(newState.guild || oldState.guild, {

            type: "voice",

            action,

            target: member.id,

            executor: null,


            description,


            severity: "normal",


            logChannel:
                channels.voice.update,


            metadata: {

                userId: member.id,

                username: member.user.tag,

                oldChannel:
                    oldState.channelId || null,

                newChannel:
                    newState.channelId || null

            },


            color: 0x5865f2,


            fields: [

                {
                    name: "Member",
                    value: `${member.user.tag} (${member.id})`
                },

                {
                    name: "Action",
                    value: action
                }

            ]

        });

    }
};
