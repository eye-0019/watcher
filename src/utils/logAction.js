const { EmbedBuilder } = require('discord.js');
const { pool } = require('./db');

async function logAction(
    guild,
    {
        action,
        eventType = "moderation",
        moderator,
        target,
        reason,
        channelId = null,
        severity = "normal",
        metadata = {},
        color = 0xFFFFFF
    }
) {
    try {
        // Save to database
        await pool.query(
            `
            INSERT INTO logs (
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
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            `,
            [
                guild.id,
                eventType,
                action,
                target?.id || target || null,
                moderator?.id || moderator || null,
                channelId,
                reason || "No reason provided",
                metadata,
                severity
            ]
        );

    } catch (err) {
        console.error("Database log error:", err);
    }


    // Send Discord log
    const logChannelId = process.env.LOG_CHANNEL_ID;
    if (!logChannelId) return;

    const channel = guild.channels.cache.get(logChannelId);
    if (!channel) return;


    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(action)
        .setDescription(
            `${target || "Unknown"} was ${action.toLowerCase()} by ${moderator || "Unknown"}`
        )
        .addFields(
            {
                name: "Reason",
                value: reason || "No reason provided"
            },
            {
                name: "Severity",
                value: severity,
                inline: true
            }
        )
        .setTimestamp();


    channel.send({
        embeds: [embed]
    }).catch(() => {});
}

module.exports = { logAction };
