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
        SELECT 
            notes,
            profile,
            personality,
            projects,
            importance,
            exchange_count,
            updated_at
        FROM ai_user_notes
        WHERE user_id = $1
        `,
        [userId]
    );

    if (!rows.length) {
        return {
            notes: null,
            profile: {},
            personality: {},
            projects: {},
            importance: 0,
            exchange_count: 0,
            updated_at: null
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


// ============================================================
// Save memory
// Keeps old memories instead of deleting them.
// ============================================================

async function saveNotes(userId, notes) {
    await pool.query(
        `
        INSERT INTO ai_user_notes (
            user_id,
            notes,
            importance,
            exchange_count
        )
        VALUES ($1, $2, 1, 0)

        ON CONFLICT (user_id)
        DO UPDATE SET
            notes =
                CASE
                    WHEN ai_user_notes.notes IS NULL
                    THEN $2
                    ELSE ai_user_notes.notes || E'\\n' || $2
                END,

            importance =
                LEAST(ai_user_notes.importance + 1, 10),

            updated_at = now()
        `,
        [userId, notes]
    );
}


// ============================================================
// Advanced memory update
// Updates specific memory categories.
// ============================================================

async function updateMemory(userId, {
    profile,
    personality,
    projects,
    importance
}) {

    await pool.query(
        `
        INSERT INTO ai_user_notes (
            user_id,
            profile,
            personality,
            projects,
            importance
        )
        VALUES ($1, $2, $3, $4, $5)

        ON CONFLICT (user_id)
        DO UPDATE SET

            profile =
                ai_user_notes.profile || $2,

            personality =
                ai_user_notes.personality || $3,

            projects =
                ai_user_notes.projects || $4,

            importance =
                GREATEST(
                    ai_user_notes.importance,
                    $5
                ),

            updated_at = now()
        `,
        [
            userId,
            profile || {},
            personality || {},
            projects || {},
            importance || 0
        ]
    );
}


module.exports = {
    getRecentMessages,
    saveMessage,
    getNotes,
    bumpExchangeCount,
    saveNotes,
    updateMemory,
    NOTES_UPDATE_EVERY
};
