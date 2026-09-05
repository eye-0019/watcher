
const { EmbedBuilder } = require("discord.js");


function createLogEmbed({
    action,
    description,
    type,
    severity = "normal",
    fields = [],
    color = 0xffffff
}) {

    const embed = new EmbedBuilder()
        .setTitle(action)
        .setDescription(description)
        .addFields(
            {
                name: "Event Type",
                value: type || "unknown",
                inline: true
            },
            {
                name: "Severity",
                value: severity,
                inline: true
            },
            ...fields
        )
        .setColor(color)
        .setTimestamp();


    return embed;
}


module.exports = {
    createLogEmbed
};
