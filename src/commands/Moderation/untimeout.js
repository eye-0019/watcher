const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { createLog } = require("../../logger/logger");
const channels = require("../../logger/channels");


module.exports = {
    data: new SlashCommandBuilder()

        .setName("untimeout")
        .setDescription("Remove a member timeout")

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        )

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to remove timeout from")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for removing timeout")
                .setRequired(false)
        ),



    async execute(interaction) {

        const user =
            interaction.options.getUser("user");


        const reason =
            interaction.options.getString("reason")
            || "No reason provided";



        const member =
            await interaction.guild.members.fetch(user.id)
            .catch(() => null);



        if (!member) {
            return interaction.reply({
                content: "User not found.",
                flags: 64
            });
        }



        await member.timeout(
            null,
            reason
        );



        await interaction.reply({
            content:
                `${user.tag} timeout has been removed.`,
            flags: 64
        });



        await createLog(interaction.guild, {

            type: "moderation",

            action: "Timeout Removed",


            target: user.id,


            executor: interaction.user.id,


            description:
                `${user.tag} had their timeout removed.\nReason: ${reason}`,


            severity: "normal",


            logChannel:
                channels.moderation.timeout,


            metadata: {

                username: user.tag,

                userId: user.id,

                reason

            },


            color: 0x57f287,


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
