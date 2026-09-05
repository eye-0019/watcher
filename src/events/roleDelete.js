const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");

module.exports = {
    name: "roleDelete",

    async execute(role) {

        await createLog(role.guild, {

            type: "role",

            action: "Role Deleted",

            target: role.id,

            executor: null,

            description:
                `Role deleted: ${role.name}`,

            severity: "warning",

            logChannel:
                channels.roles.delete,

            metadata: {

                roleName: role.name,

                roleId: role.id,

                color: role.hexColor

            },

            color: 0xff0000,


            fields: [

                {
                    name: "Role",
                    value: `${role.name} (${role.id})`
                },

                {
                    name: "Position",
                    value: `${role.position}`
                }

            ]

        });

    }
};
