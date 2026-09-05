const { Events } = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction) {

        if (!interaction.isChatInputCommand()) return;


        const command = interaction.client.commands.get(
            interaction.commandName
        );


        if (!command) return;


        try {

            await command.execute(interaction);

        } catch (error) {

            console.error(
                `Error executing /${interaction.commandName}:`,
                error
            );


            if (interaction.replied || interaction.deferred) {

                await interaction.editReply({
                    content: "There was an error while executing this command."
                }).catch(() => {});


            } else {

                await interaction.reply({
                    content: "There was an error while executing this command.",
                    flags: 64
                }).catch(() => {});

            }

        }

    }
};
