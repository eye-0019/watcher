const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");

module.exports = {
    name: "guildMemberUpdate",

    async execute(oldMember, newMember) {

        const changes = [];


        if (oldMember.nickname !== newMember.nickname) {
            changes.push(
                `Nickname: ${oldMember.nickname || "None"} → ${newMember.nickname || "None"}`
            );
        }


        const oldRoles = new Set(oldMember.roles.cache.map(r => r.id));
        const newRoles = new Set(newMember.roles.cache.map(r => r.id));


        const addedRoles = [...newRoles].filter(r => !oldRoles.has(r));
        const removedRoles = [...oldRoles].filter(r => !newRoles.has(r));


        if (addedRoles.length) {
            changes.push(
                `Roles added: ${addedRoles.map(r => `<@&${r}>`).join(", ")}`
            );
        }


        if (removedRoles.length) {
            changes.push(
                `Roles removed: ${removedRoles.map(r => `<@&${r}>`).join(", ")}`
            );
        }


        if (!changes.length) return;



        await createLog(newMember.guild, {

            type: "member",

            action: "Member Updated",

            target: newMember.id,

            executor: null,


            description:
                `${newMember.user.tag} was updated`,


            severity: "normal",


            logChannel:
                channels.members.update,


            metadata: {

                userId: newMember.id,

                username: newMember.user.tag,

                changes

            },


            color: 0xffff00,


            fields: [

                {
                    name: "Member",
                    value: `${newMember.user.tag} (${newMember.id})`
                },

                {
                    name: "Changes",
                    value: changes.join("\n").slice(0, 1024)
                }

            ]

        });

    }
};
