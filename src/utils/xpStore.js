const { pool } = require('./db');

const COOLDOWN_MS = 60 * 1000; // 1 minute between XP gains, prevents spam-leveling
const XP_MIN = 15;
const XP_MAX = 25;

function xpForLevel(level) {
    return 5 * (level ** 2) + 50 * level + 100;
}

async function getUser(userId) {
    const { rows } = await pool.query('SELECT xp, level FROM xp WHERE user_id = $1', [userId]);
    if (!rows.length) return { xp: 0, level: 0 };
    return { xp: rows[0].xp, level: rows[0].level };
}

// Adds XP for a message, respecting cooldown. Returns { leveledUp, newLevel } or null if on cooldown.
async function addMessageXp(userId) {
    const { rows } = await pool.query('SELECT xp, level, last_message_at FROM xp WHERE user_id = $1', [userId]);
    const now = Date.now();
    const user = rows.length ? rows[0] : { xp: 0, level: 0, last_message_at: 0 };

    if (now - Number(user.last_message_at) < COOLDOWN_MS) return null;

    let xp = user.xp + Math.floor(Math.random() * (XP_MAX - XP_MIN + 1)) + XP_MIN;
    let level = user.level;
    let leveledUp = false;

    while (xp >= xpForLevel(level)) {
        xp -= xpForLevel(level);
        level += 1;
        leveledUp = true;
    }

    await pool.query(
        `INSERT INTO xp (user_id, xp, level, last_message_at) VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id) DO UPDATE SET xp = $2, level = $3, last_message_at = $4`,
        [userId, xp, level, now]
    );

    return { leveledUp, newLevel: level };
}

async function getLeaderboard(limit = 10) {
    const { rows } = await pool.query(
        'SELECT user_id, xp, level FROM xp ORDER BY level DESC, xp DESC LIMIT $1',
        [limit]
    );
    return rows.map(r => ({ userId: r.user_id, xp: r.xp, level: r.level }));
}

module.exports = { getUser, addMessageXp, getLeaderboard, xpForLevel };
