const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { createLog } = require("../../logger/logger");
const channels = require("../../logger/channels");


module.exports = {
    data: new SlashCommandBuilder()

        .setName("addrole")
        .setDescription("Add a role to a member")

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageRoles
        )

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to give role to")
                .setRequired(true)
        )

        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("Role to add")
                .setRequired(true)
        ),



    async execute(interaction) {

        const user =
            interaction.options.getUser("user");


        const role =
            interaction.options.getRole("role");



        const member =
            await interaction.guild.members
                .fetch(user.id)
                .catch(() => null);



        if (!member) {
            return interaction.reply({
                content: "User not found.",
                ephemeral: true
            });
        }



        await member.roles.add(role);



        await interaction.reply({
            content:
                `Added ${role.name} to ${user.tag}.`,
            ephemeral: true
        });



        await createLog(interaction.guild, {

            type: "moderation",

            action: "Role Added",


            target: user.id,


            executor:
                interaction.user.id,


            description:
                `${role.name} was added to ${user.tag}.`,


            severity: "normal",


            logChannel:
                channels.server.roles,


            metadata: {

                userId: user.id,

                username: user.tag,

                roleId: role.id,

                roleName: role.name

            },


            color: 0x57f287,


            fields: [

                {
                    name: "Moderator",
                    value:
                        `${interaction.user.tag} (${interaction.user.id})`
                },

                {
                    name: "Role",
                    value:
                        `${role.name} (${role.id})`
                }

            ]

        });

    }
};
