const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { createLog } = require("../../logger/logger");
const channels = require("../../logger/channels");


module.exports = {
    data: new SlashCommandBuilder()

        .setName("purge")
        .setDescription("Delete multiple messages")

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageMessages
        )

        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("Number of messages to delete")
                .setRequired(true)
        ),



    async execute(interaction) {

        const amount =
            interaction.options.getInteger("amount");



        if (amount < 1 || amount > 100) {
            return interaction.reply({
                content: "Amount must be between 1 and 100.",
                ephemeral: true
            });
        }



        const deleted =
            await interaction.channel.bulkDelete(
                amount,
                true
            );



        await interaction.reply({
            content:
                `Deleted ${deleted.size} messages.`,
            ephemeral: true
        });



        await createLog(interaction.guild, {

            type: "moderation",

            action: "Messages Purged",


            executor:
                interaction.user.id,


            channel:
                interaction.channel.id,


            description:
                `${interaction.user.tag} deleted ${deleted.size} messages in <#${interaction.channel.id}>.`,


            severity: "medium",


            logChannel:
                channels.messages.delete,


            metadata: {

                amount: deleted.size,

                channelId:
                    interaction.channel.id

            },


            color: 0xff9900,


            fields: [

                {
                    name: "Moderator",
                    value:
                        `${interaction.user.tag} (${interaction.user.id})`
                },

                {
                    name: "Channel",
                    value:
                        `<#${interaction.channel.id}>`
                }

            ]

        });

    }
};
