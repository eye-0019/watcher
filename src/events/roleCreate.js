const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");

module.exports = {
    name: "roleCreate",

    async execute(role) {

        await createLog(role.guild, {

            type: "role",

            action: "Role Created",

            target: role.id,

            executor: null,

            description:
                `Role created: ${role.name}`,

            severity: "normal",

            logChannel:
                channels.roles.create,

            metadata: {

                roleName: role.name,

                roleId: role.id,

                color: role.hexColor

            },

            color: 0x00ff00,


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
