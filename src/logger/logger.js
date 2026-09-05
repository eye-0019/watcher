const { EmbedBuilder } = require("discord.js");
const { pool } = require("../utils/db");


async function createLog(guild, {
    type,
    action,
    target = null,
    executor = null,
    channel = null,
    description,
    metadata = {},
    severity = "normal",
    logChannel,
    color = 0xffffff
}) {

    // Save to database
    try {
        await pool.query(
            `
            INSERT INTO logs
            (
                guild_id,
                event_type,
                action,
                target_id,
                executor_id,
                channel_id,
                description,
                metadata,
                severity
            )
            VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            `,
            [
                guild.id,
                type,
                action,
                target,
                executor,
                channel,
                description,
                metadata,
                severity
            ]
        );

    } catch (err) {
        console.error("Logger database error:", err);
    }


    // Send Discord log
    if (!logChannel) return;

    const channelObj = guild.channels.cache.get(logChannel);

    if (!channelObj) return;


    const embed = new EmbedBuilder()
        .setTitle(action)
        .setDescription(description)
        .addFields(
            {
                name: "Severity",
                value: severity,
                inline: true
            },
            {
                name: "Event",
                value: type,
                inline: true
            }
        )
        .setColor(color)
        .setTimestamp();


    channelObj.send({
        embeds: [embed]
    }).catch(() => {});
}


module.exports = {
    createLog
};
