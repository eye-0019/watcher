const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


const {
    getHealth
} = require("../../utils/aiHealth");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("watcher")

        .setDescription(
            "View Watcher's AI status"
        ),


    async execute(interaction) {

        const health = getHealth();


        const uptime =
            Math.floor(
                health.uptime / 60
            );


        const embed =
            new EmbedBuilder()

                .setTitle(
                    "Watcher Status"
                )

                .setDescription(
`
AI Status:
${health.status || "unknown"}

Current Model:
${health.currentModel || "unknown"}

Response Time:
${health.lastResponseTime || 0}ms

Requests:
${health.totalRequests || 0}

Failed:
${health.failedRequests || 0}

Uptime:
${uptime} minutes

Last Error:
${health.lastError || "None"}
`
                )

                .setTimestamp();


        await interaction.reply({
            embeds: [embed]
        });

    }

};
