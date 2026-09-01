const { pool } = require('./db');

const HISTORY_LIMIT = 10; // last 10 raw messages (~5 exchanges) kept as short-term context
const NOTES_UPDATE_EVERY = 6; // regenerate the permanent notes every 6 exchanges

// ============================================================
// Short-term rolling conversation history
// ============================================================

async function getRecentMessages(userId) {
    const { rows } = await pool.query(
        'SELECT role, content FROM ai_messages WHERE user_id = $1 ORDER BY id DESC LIMIT $2',
        [userId, HISTORY_LIMIT]
    );
    return rows.reverse(); // oldest first, so it reads like a real conversation
}

async function saveMessage(userId, role, content) {
    await pool.query(
        'INSERT INTO ai_messages (user_id, role, content) VALUES ($1, $2, $3)',
        [userId, role, content]
    );
}

// ============================================================
// Permanent per-user relationship notes
// ============================================================

async function getNotes(userId) {
    const { rows } = await pool.query(
        'SELECT notes, exchange_count FROM ai_user_notes WHERE user_id = $1',
        [userId]
    );
    return rows.length ? rows[0] : { notes: null, exchange_count: 0 };
}

// Increments the exchange counter, returns the new count.
async function bumpExchangeCount(userId) {
    const { rows } = await pool.query(
        `INSERT INTO ai_user_notes (user_id, exchange_count) VALUES ($1, 1)
         ON CONFLICT (user_id) DO UPDATE SET exchange_count = ai_user_notes.exchange_count + 1
         RETURNING exchange_count`,
        [userId]
    );
    return rows[0].exchange_count;
}

async function saveNotes(userId, notes) {
    await pool.query(
        `INSERT INTO ai_user_notes (user_id, notes, exchange_count) VALUES ($1, $2, 0)
         ON CONFLICT (user_id) DO UPDATE SET notes = $2, exchange_count = 0, updated_at = now()`,
        [userId, notes]
    );
}

module.exports = {
    getRecentMessages,
    saveMessage,
    getNotes,
    bumpExchangeCount,
    saveNotes,
    NOTES_UPDATE_EVERY
};
