const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getHealth } = require("../../utils/aiHealth");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("watcher")
        .setDescription("View Watcher's AI status"),

    async execute(interaction) {

        const health = getHealth();

        const embed = new EmbedBuilder()
            .setTitle("🤖 Watcher Status")
            .setDescription(
                `**Status:** ${health.status || "Unknown"}\n` +
                `**Model:** ${health.currentModel || "Unknown"}\n` +
                `**Requests:** ${health.totalRequests || 0}\n` +
                `**Failed:** ${health.failedRequests || 0}`
            )
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    }
};
