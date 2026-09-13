const { pool } = require('./db');


// Add an invite credit when someone joins
async function addInviteCredit({
    guildId,
    inviterId,
    invitedUserId,
    inviteCode
}) {
    await pool.query(
        `
        INSERT INTO invite_credits
        (
            guild_id,
            inviter_id,
            invited_user_id,
            invite_code,
            active
        )
        VALUES ($1, $2, $3, $4, TRUE)

        ON CONFLICT (guild_id, invited_user_id)
        DO UPDATE SET
            inviter_id = EXCLUDED.inviter_id,
            invite_code = EXCLUDED.invite_code,
            active = TRUE
        `,
        [
            guildId,
            inviterId,
            invitedUserId,
            inviteCode || null
        ]
    );
}


// Remove invite credit when someone leaves
async function removeInviteCredit(guildId, userId) {
    await pool.query(
        `
        UPDATE invite_credits
        SET active = FALSE
        WHERE guild_id = $1
        AND invited_user_id = $2
        `,
        [
            guildId,
            userId
        ]
    );
}


// Count how many active invites someone has
async function getInviteCount(guildId, inviterId) {
    const { rows } = await pool.query(
        `
        SELECT COUNT(*)::int AS count
        FROM invite_credits
        WHERE guild_id = $1
        AND inviter_id = $2
        AND active = TRUE
        `,
        [
            guildId,
            inviterId
        ]
    );

    return rows[0]?.count || 0;
}


// Find who invited a member
async function getInviter(guildId, userId) {
    const { rows } = await pool.query(
        `
        SELECT inviter_id
        FROM invite_credits
        WHERE guild_id = $1
        AND invited_user_id = $2
        AND active = TRUE
        `,
        [
            guildId,
            userId
        ]
    );

    return rows[0]?.inviter_id || null;
}


module.exports = {
    addInviteCredit,
    removeInviteCredit,
    getInviteCount,
    getInviter
};
