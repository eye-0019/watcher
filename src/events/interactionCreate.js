module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand() && !interaction.isMessageContextMenuCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (err) {
            console.error(`Error executing /${interaction.commandName}:`, err);
            const errorReply = { content: 'There was an error while executing this command.', ephemeral: true };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorReply);
            } else {
                await interaction.reply(errorReply);
            }
        }
    }
};
