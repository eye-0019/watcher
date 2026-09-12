const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { saveNotes } = require('../../utils/aiMemoryStore');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('memory-add')
        .setDescription('Add a manual memory note for a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to save memory for')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('note')
                .setDescription('Memory note to save')
                .setRequired(true)
        ),

    async execute(interaction) {

        // Owner only
        if (interaction.user.id !== process.env.OWNER_ID) {
            return interaction.reply({
                content: '❌ You cannot use this command.',
                flags: 64
            });
        }

        const user = interaction.options.getUser('user');
        const note = interaction.options.getString('note');

        await saveNotes(
            user.id,
            `Manual note: ${note}`
        );

        await interaction.reply({
            content:
                `🧠 Saved memory for **${user.username}**:\n> ${note}`,
            flags: 64
        });
    }
};
