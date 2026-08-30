const { pool } = require('./db');

async function addWarning(userId, warning) {
    await pool.query(
        'INSERT INTO warnings (user_id, reason, moderator) VALUES ($1, $2, $3)',
        [userId, warning.reason, warning.moderator]
    );
    const { rows } = await pool.query('SELECT COUNT(*) FROM warnings WHERE user_id = $1', [userId]);
    return parseInt(rows[0].count, 10);
}

async function getWarnings(userId) {
    const { rows } = await pool.query(
        'SELECT reason, moderator, created_at FROM warnings WHERE user_id = $1 ORDER BY id ASC',
        [userId]
    );
    return rows.map(r => ({ reason: r.reason, moderator: r.moderator, date: r.created_at }));
}

async function removeLastWarning(userId) {
    const { rows } = await pool.query(
        'SELECT id FROM warnings WHERE user_id = $1 ORDER BY id DESC LIMIT 1',
        [userId]
    );
    if (!rows.length) return false;
    await pool.query('DELETE FROM warnings WHERE id = $1', [rows[0].id]);
    return true;
}

module.exports = { addWarning, getWarnings, removeLastWarning };
