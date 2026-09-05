const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { createLog } = require("../../logger/logger");
const channels = require("../../logger/channels");
const { addWarning } = require("../../utils/warningsStore");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn a member")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to warn")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for warning")
                .setRequired(false)
        ),


    async execute(interaction) {

        const user = interaction.options.getUser("user");
        const reason =
            interaction.options.getString("reason")
            || "No reason provided";


        await addWarning(
            user.id,
            reason,
            interaction.user.id
        );


        await interaction.reply({
            content:
                `${user.tag} has been warned.`,
            ephemeral: true
        });



        await createLog(interaction.guild, {

            type: "moderation",

            action: "Member Warned",


            target: user.id,


            executor: interaction.user.id,


            description:
                `${user.tag} was warned.\nReason: ${reason}`,


            severity: "medium",


            logChannel: channels.moderation.warn,


            metadata: {

                username: user.tag,

                userId: user.id,

                reason

            },


            color: 0xffcc00,


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
