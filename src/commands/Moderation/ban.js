const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { createLog } = require("../../logger/logger");
const channels = require("../../logger/channels");


module.exports = {

    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a member")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to ban")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for ban")
                .setRequired(false)
        ),


    async execute(interaction) {

        const user = interaction.options.getUser("user");

        const reason =
            interaction.options.getString("reason")
            || "No reason provided";


        await interaction.deferReply({
            ephemeral: true
        });


        try {

            await interaction.guild.members.ban(user.id, {
                reason
            });


            await interaction.editReply({
                content:
                    `${user.tag} has been banned.`
            });



            createLog(interaction.guild, {

                type: "moderation",

                action: "Member Banned",

                target: user.id,

                executor: interaction.user.id,

                description:
                    `${user.tag} was banned.\nReason: ${reason}`,

                severity: "critical",

                logChannel:
                    channels.moderation.ban,

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
                    },

                    {
                        name: "Reason",
                        value: reason
                    }

                ]

            }).catch(err =>
                console.error("Ban log failed:", err)
            );


        } catch (error) {

            console.error("Ban command failed:", error);


            await interaction.editReply({

                content:
                    "Failed to ban this user."

            });

        }

    }

};
