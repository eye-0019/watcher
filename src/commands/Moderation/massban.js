const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { createLog } = require("../../logger/logger");
const channels = require("../../logger/channels");


module.exports = {
    data: new SlashCommandBuilder()

        .setName("massban")
        .setDescription("Ban multiple members")

        .setDefaultMemberPermissions(
            PermissionFlagsBits.BanMembers
        )

        .addStringOption(option =>
            option
                .setName("users")
                .setDescription("User IDs separated by spaces")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for bans")
                .setRequired(false)
        ),



    async execute(interaction) {

        const users =
            interaction.options
                .getString("users")
                .split(/\s+/);


        const reason =
            interaction.options.getString("reason")
            || "No reason provided";


        let banned = [];



        for (const id of users) {

            try {

                await interaction.guild.members.ban(
                    id,
                    {
                        reason
                    }
                );

                banned.push(id);

            } catch {}

        }



        await interaction.reply({
            content:
                `Banned ${banned.length} members.`,
            flags: 64
        });



        await createLog(interaction.guild, {

            type: "moderation",

            action: "Mass Ban",


            executor:
                interaction.user.id,


            description:
                `${interaction.user.tag} mass banned ${banned.length} members.\nReason: ${reason}`,


            severity: "critical",


            logChannel:
                channels.moderation.ban,


            metadata: {

                users: banned,

                count: banned.length,

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
                    name: "Users",
                    value:
                        banned.length
                            ? banned.join("\n")
                            : "None"
                }

            ]

        });

    }
};
