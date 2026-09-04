const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getNotes } = require("../../utils/aiMemoryStore");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("memory")
        .setDescription("View Watcher's memory about a user")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to check memory for")
                .setRequired(true)
        ),

    async execute(interaction) {

        // owner only
        if (interaction.user.id !== process.env.OWNER_ID) {
            return interaction.reply({
                content: "nah 😭",
                ephemeral: true
            });
        }

        const user = interaction.options.getUser("user");

        const memory = await getNotes(user.id);

        if (!memory || memory.exchange_count === 0) {
            return interaction.reply(
                `i don't have any memories about ${user.username} yet 🫩`
            );
        }

        const embed = new EmbedBuilder()
            .setTitle("🧠 Watcher Memory")
            .setDescription(
                `**User:** ${user.username}\n` +
                `**ID:** ${user.id}\n\n` +
                `**Notes:**\n${memory.notes || "No notes saved."}\n\n` +
                `**Conversations remembered:** ${memory.exchange_count}`
            )
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    }
};
