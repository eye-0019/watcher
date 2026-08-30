const { pool } = require('./db');

async function addReactionRole(messageId, emoji, roleId) {
    await pool.query(
        `INSERT INTO reaction_roles (message_id, emoji, role_id) VALUES ($1, $2, $3)
         ON CONFLICT (message_id, emoji) DO UPDATE SET role_id = $3`,
        [messageId, emoji, roleId]
    );
}

async function getRoleId(messageId, emoji) {
    const { rows } = await pool.query(
        'SELECT role_id FROM reaction_roles WHERE message_id = $1 AND emoji = $2',
        [messageId, emoji]
    );
    return rows.length ? rows[0].role_id : null;
}

module.exports = { addReactionRole, getRoleId };
