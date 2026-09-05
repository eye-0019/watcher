const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { createLog } = require("../../logger/logger");
const channels = require("../../logger/channels");


module.exports = {
    data: new SlashCommandBuilder()

        .setName("timeout")
        .setDescription("Timeout a member")

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        )

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to timeout")
                .setRequired(true)
        )

        .addIntegerOption(option =>
            option
                .setName("minutes")
                .setDescription("Timeout duration in minutes")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for timeout")
                .setRequired(false)
        ),



    async execute(interaction) {

        const user =
            interaction.options.getUser("user");


        const minutes =
            interaction.options.getInteger("minutes");


        const reason =
            interaction.options.getString("reason")
            || "No reason provided";



        const member =
            await interaction.guild.members.fetch(user.id)
            .catch(() => null);



        if (!member) {
            return interaction.reply({
                content: "User not found.",
                ephemeral: true
            });
        }



        await member.timeout(
            minutes * 60 * 1000,
            reason
        );



        await interaction.reply({
            content:
                `${user.tag} has been timed out for ${minutes} minutes.`,
            ephemeral: true
        });



        await createLog(interaction.guild, {

            type: "moderation",

            action: "Member Timed Out",


            target: user.id,


            executor: interaction.user.id,


            description:
                `${user.tag} was timed out for ${minutes} minutes.\nReason: ${reason}`,


            severity: "high",


            logChannel:
                channels.moderation.timeout,


            metadata: {

                username: user.tag,

                userId: user.id,

                duration: `${minutes} minutes`,

                reason

            },


            color: 0xff9900,


            fields: [

                {
                    name: "Moderator",
                    value:
                        `${interaction.user.tag} (${interaction.user.id})`
                },

                {
                    name: "Duration",
                    value:
                        `${minutes} minutes`
                }

            ]

        });

    }
};
