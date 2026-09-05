const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { createLog } = require("../../logger/logger");
const channels = require("../../logger/channels");


module.exports = {
    data: new SlashCommandBuilder()

        .setName("removerole")
        .setDescription("Remove a role from a member")

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageRoles
        )

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to remove role from")
                .setRequired(true)
        )

        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("Role to remove")
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
                flags: 64
            });
        }



        await member.roles.remove(role);



        await interaction.reply({
            content:
                `Removed ${role.name} from ${user.tag}.`,
            flags: 64
        });



        await createLog(interaction.guild, {

            type: "moderation",

            action: "Role Removed",


            target: user.id,


            executor:
                interaction.user.id,


            description:
                `${role.name} was removed from ${user.tag}.`,


            severity: "normal",


            logChannel:
                channels.server.roles,


            metadata: {

                userId: user.id,

                username: user.tag,

                roleId: role.id,

                roleName: role.name

            },


            color: 0xff9900,


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
