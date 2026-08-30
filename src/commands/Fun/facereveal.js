const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Rate Face Reveal')
        .setType(ApplicationCommandType.Message),

    async execute(interaction) {
        const message = interaction.targetMessage;

        try {
            await message.react('✅');
            await message.react('❌');
        } catch (err) {
            console.error('Error adding face reveal reactions:', err);
            return interaction.reply({ content: 'Could not add reactions to that message.', ephemeral: true });
        }

        return interaction.reply({ content: 'Face reveal is now open for rating!', ephemeral: true });
    }
};
