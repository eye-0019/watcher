
const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


const {
    getHealth
} = require("../utils/aiHealth");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("watcher")

        .setDescription(
            "View Watcher AI status"
        ),



    async execute(interaction) {


        const health =
            getHealth();



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
${health.status}

Current Model:
${health.currentModel}

Response Time:
${health.lastResponseTime}ms

Requests:
${health.totalRequests}

Failed:
${health.failedRequests}

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
