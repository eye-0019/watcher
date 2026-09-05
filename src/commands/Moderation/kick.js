const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { createLog } = require("../../logger/logger");
const channels = require("../../logger/channels");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick a member")
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to kick")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for kick")
                .setRequired(false)
        ),


    async execute(interaction) {

        const user = interaction.options.getUser("user");
        const reason =
            interaction.options.getString("reason")
            || "No reason provided";


        const member = await interaction.guild.members.fetch(user.id)
            .catch(() => null);


        if (!member) {
            return interaction.reply({
                content: "User not found.",
                ephemeral: true
            });
        }


        await member.kick(reason);



        await interaction.reply({
            content:
                `${user.tag} has been kicked.`,
            ephemeral: true
        });



        await createLog(interaction.guild, {

            type: "moderation",

            action: "Member Kicked",


            target: user.id,


            executor: interaction.user.id,


            description:
                `${user.tag} was kicked.\nReason: ${reason}`,


            severity: "high",


            logChannel: channels.moderation.kick,


            metadata: {

                username: user.tag,

                userId: user.id,

                reason

            },


            color: 0xff0000,


            fields: [

                {
                    name: "Moderator",
                    value:
                        `${interaction.user.tag} (${interaction.user.id})`
                }

            ]

        });

    }
};
