const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { createLog } = require("../../logger/logger");
const channels = require("../../logger/channels");


module.exports = {
    data: new SlashCommandBuilder()

        .setName("masskick")
        .setDescription("Kick multiple members")

        .setDefaultMemberPermissions(
            PermissionFlagsBits.KickMembers
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
                .setDescription("Reason for kicks")
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


        let kicked = [];



        for (const id of users) {

            try {

                const member =
                    await interaction.guild.members
                        .fetch(id)
                        .catch(() => null);


                if (!member) continue;


                await member.kick(reason);

                kicked.push(id);


            } catch {}

        }



        await interaction.reply({
            content:
                `Kicked ${kicked.length} members.`,
            flags: 64
        });



        await createLog(interaction.guild, {

            type: "moderation",

            action: "Mass Kick",


            executor:
                interaction.user.id,


            description:
                `${interaction.user.tag} mass kicked ${kicked.length} members.\nReason: ${reason}`,


            severity: "high",


            logChannel:
                channels.moderation.kick,


            metadata: {

                users: kicked,

                count: kicked.length,

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
                        kicked.length
                            ? kicked.join("\n")
                            : "None"
                }

            ]

        });

    }
};
