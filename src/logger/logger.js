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

    } catch (error) {
        console.error("Logger database error:", error);
    }



    // Send Discord log
    if (!logChannel) return;


    const discordChannel = guild.channels.cache.get(logChannel);

    if (!discordChannel) return;


    const embed = createLogEmbed({
        action,
        description,
        type,
        severity,
        fields,
        color
    });


    discordChannel.send({
        embeds: [embed]
    }).catch(() => {});

}



module.exports = {
    createLog
};
