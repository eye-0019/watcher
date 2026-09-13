const { SlashCommandBuilder } = require('discord.js');
const { resetMemory } = require('../../utils/aiMemoryStore');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('memory-reset')
        .setDescription("Reset Watcher's memory for a user")
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to reset memory for')
                .setRequired(true)
        ),

    async execute(interaction) {

        if (interaction.user.id !== process.env.OWNER_ID) {
            return interaction.reply({
                content: '❌ You cannot use this command.',
                flags: 64
            });
        }

        const user = interaction.options.getUser('user');

        try {
            await resetMemory(user.id);

            await interaction.reply({
                content: `🧠 Reset all Watcher memory for **${user.username}**`,
                flags: 64
            });

        } catch (error) {
            console.error('Memory reset failed:', error);

            await interaction.reply({
                content: '❌ Failed to reset memory.',
                flags: 64
            });
        }
    }
};