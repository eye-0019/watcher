const { pool } = require('./db');

async function setTicket(userId, channelId) {
    await pool.query(
        `INSERT INTO dm_tickets (user_id, channel_id) VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE SET channel_id = $2`,
        [userId, channelId]
    );
}

async function getChannelForUser(userId) {
    const { rows } = await pool.query('SELECT channel_id FROM dm_tickets WHERE user_id = $1', [userId]);
    return rows.length ? rows[0].channel_id : null;
}

async function getUserForChannel(channelId) {
    const { rows } = await pool.query('SELECT user_id FROM dm_tickets WHERE channel_id = $1', [channelId]);
    return rows.length ? rows[0].user_id : null;
}

module.exports = { setTicket, getChannelForUser, getUserForChannel };
