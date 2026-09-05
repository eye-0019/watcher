const { pool } = require("../utils/db");
const { createLogEmbed } = require("./formatter");

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
    color = 0xffffff,
    fields = []
}) {

    // Database log
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
    } catch (error) {
        console.error("Logger database error:", error);
    }


    // Discord log
    if (!logChannel) {
        console.log("No log channel provided");
        return;
    }


    const discordChannel = await guild.channels.fetch(logChannel)
        .catch(err => {
            console.error("Failed to fetch log channel:", err);
            return null;
        });


    if (!discordChannel) {
        console.log("Log channel not found:", logChannel);
        return;
    }


    const embed = createLogEmbed({
        action,
        description,
        type,
        severity,
        fields,
        color
    });


    await discordChannel.send({
        embeds: [embed]
    }).catch(error => {
        console.error("Failed sending log:", error);
    });

}


module.exports = {
    createLog
};
