const { EmbedBuilder } = require('discord.js');
const { pool } = require('./db');
const { getLeaderboard } = require('./xpStore');
const { sortedCandidates } = require('./ratingsStore');

async function getStoredMessage(kind) {
    const { rows } = await pool.query('SELECT channel_id, message_id FROM leaderboard_messages WHERE kind = $1', [kind]);
    return rows.length ? rows[0] : null;
}

async function saveStoredMessage(kind, channelId, messageId) {
    await pool.query(
        `INSERT INTO leaderboard_messages (kind, channel_id, message_id) VALUES ($1, $2, $3)
         ON CONFLICT (kind) DO UPDATE SET channel_id = $2, message_id = $3`,
        [kind, channelId, messageId]
    );
}

async function getOrCreateLeaderboardMessage(client, kind, channelId) {
    const channel = client.channels.cache.get(channelId);
    if (!channel) return null;

    const stored = await getStoredMessage(kind);
    if (stored && stored.channel_id === channelId) {
        const msg = await channel.messages.fetch(stored.message_id).catch(() => null);
        if (msg) return msg;
    }

    const placeholder = await channel.send('Setting up the leaderboard...').catch(() => null);
    if (placeholder) await saveStoredMessage(kind, channelId, placeholder.id);
    return placeholder;
}

async function updateLiveLevelLeaderboard(client) {
    const channelId = process.env.LEVEL_LEADERBOARD_CHANNEL_ID;
    if (!channelId) return;

    const message = await getOrCreateLeaderboardMessage(client, 'levels', channelId);
    if (!message) return;

    const top = await getLeaderboard(10);
    const lines = top.length
        ? top.map((u, i) => `**${i + 1}.** <@${u.userId}> — Level ${u.level} (${u.xp} XP)`)
        : ['No one has earned any XP yet.'];

    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Leaderboard')
        .setDescription(lines.join('\n'))
        .setFooter({ text: 'Updates automatically' })
        .setTimestamp();

    message.edit({ content: null, embeds: [embed] }).catch(() => {});
}

async function updateLiveRatingLeaderboard(client) {
    const channelId = process.env.RATING_LEADERBOARD_CHANNEL_ID;
    if (!channelId) return;

    const message = await getOrCreateLeaderboardMessage(client, 'ratings', channelId);
    if (!message) return;

    const uglyTop = await sortedCandidates('ugly');
    const hotTop = await sortedCandidates('hot');

    const hotLine = hotTop.length ? `<@${hotTop[0].userId}> — ${hotTop[0].count} upvotes` : 'No one yet';
    const uglyLine = uglyTop.length ? `<@${uglyTop[0].userId}> — ${uglyTop[0].count} downvotes` : 'No one yet';

    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Leaderboard')
        .addFields(
            { name: 'Best Looking', value: hotLine },
            { name: 'Ugliest', value: uglyLine }
        )
        .setFooter({ text: 'Updates automatically' })
        .setTimestamp();

    message.edit({ content: null, embeds: [embed] }).catch(() => {});
}

module.exports = { updateLiveLevelLeaderboard, updateLiveRatingLeaderboard };
