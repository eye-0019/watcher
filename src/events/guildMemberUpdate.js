const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");


module.exports = {
    name: "guildMemberUpdate",

    async execute(oldMember, newMember) {

        const changes = [];


        // Nickname change
        if (oldMember.nickname !== newMember.nickname) {

            changes.push(
                {
                    name: "Nickname",
                    value:
                        `Before: ${oldMember.nickname || oldMember.user.username}\n` +
                        `After: ${newMember.nickname || newMember.user.username}`
                }
            );

        }


        // Role changes
        const oldRoles = new Set(
            oldMember.roles.cache.map(role => role.id)
        );

        const newRoles = new Set(
            newMember.roles.cache.map(role => role.id)
        );


        const addedRoles = [...newRoles]
            .filter(role => !oldRoles.has(role));


        const removedRoles = [...oldRoles]
            .filter(role => !newRoles.has(role));


        if (addedRoles.length) {

            changes.push({
                name: "Roles Added",
                value: addedRoles
                    .map(id => `<@&${id}>`)
                    .join(", ")
            });

        }


        if (removedRoles.length) {

            changes.push({
                name: "Roles Removed",
                value: removedRoles
                    .map(id => `<@&${id}>`)
                    .join(", ")
            });

        }


        // Nothing changed
        if (!changes.length) return;



        await createLog(newMember.guild, {

            type: "member",

            action: "Member Updated",

            target: newMember.id,


            description:
                `${newMember.user.tag} was updated.`,


            severity: "normal",


            logChannel: channels.members.update,


            metadata: {
                userId: newMember.id,
                username: newMember.user.tag
            },


            color: 0x3498db,


            fields: changes

        });

    }
};
