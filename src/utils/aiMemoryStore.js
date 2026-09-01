const { pool } = require('./db');

const HISTORY_LIMIT = 10;
const NOTES_UPDATE_EVERY = 6;

// ============================================================
// Short-term conversation memory
// Keeps the last 10 messages for each user.
// ============================================================

async function getRecentMessages(userId) {
    const { rows } = await pool.query(
        `
        SELECT role, content
        FROM ai_messages
        WHERE user_id = $1
        ORDER BY id DESC
        LIMIT $2
        `,
        [userId, HISTORY_LIMIT]
    );

    return rows.reverse();
}

async function saveMessage(userId, role, content) {
    await pool.query(
        `
        INSERT INTO ai_messages (user_id, role, content)
        VALUES ($1, $2, $3)
        `,
        [userId, role, content]
    );
}

// ============================================================
// Permanent relationship memory
// ============================================================

async function getNotes(userId) {
    const { rows } = await pool.query(
        `
        SELECT notes, exchange_count
        FROM ai_user_notes
        WHERE user_id = $1
        `,
        [userId]
    );

    if (!rows.length) {
        return {
            notes: null,
            exchange_count: 0
        };
    }

    return rows[0];
}

async function bumpExchangeCount(userId) {
    const { rows } = await pool.query(
        `
        INSERT INTO ai_user_notes (
            user_id,
            exchange_count
        )
        VALUES ($1, 1)

        ON CONFLICT (user_id)
        DO UPDATE SET
            exchange_count =
                ai_user_notes.exchange_count + 1

        RETURNING exchange_count
        `,
        [userId]
    );

    return rows[0].exchange_count;
}

async function saveNotes(userId, notes) {
    await pool.query(
        `
        INSERT INTO ai_user_notes (
            user_id,
            notes,
            exchange_count
        )
        VALUES ($1, $2, 0)

        ON CONFLICT (user_id)
        DO UPDATE SET
            notes = $2,
            exchange_count = 0,
            updated_at = now()
        `,
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
