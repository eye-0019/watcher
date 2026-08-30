const { pool } = require('./db');

async function setCount(category, messageId, userId, count) {
    if (count <= 0) {
        await pool.query('DELETE FROM rating_counts WHERE category = $1 AND message_id = $2', [category, messageId]);
    } else {
        await pool.query(
            `INSERT INTO rating_counts (category, message_id, user_id, count) VALUES ($1, $2, $3, $4)
             ON CONFLICT (category, message_id) DO UPDATE SET count = $4`,
            [category, messageId, userId, count]
        );
    }
}

// Highest count first; ties broken by whichever row was created first (the current title-holder).
async function sortedCandidates(category) {
    const { rows } = await pool.query(
        'SELECT message_id, user_id, count FROM rating_counts WHERE category = $1 ORDER BY count DESC, created_at ASC',
        [category]
    );
    return rows.map(r => ({ messageId: r.message_id, userId: r.user_id, count: r.count }));
}

async function bestCountForUser(category, userId) {
    const { rows } = await pool.query(
        'SELECT MAX(count) as max FROM rating_counts WHERE category = $1 AND user_id = $2',
        [category, userId]
    );
    return rows[0].max === null ? -1 : rows[0].max;
}

async function getHolder(category) {
    const { rows } = await pool.query('SELECT user_id FROM rating_holders WHERE category = $1', [category]);
    return rows.length ? rows[0].user_id : null;
}

async function setHolder(category, userId) {
    await pool.query(
        `INSERT INTO rating_holders (category, user_id) VALUES ($1, $2)
         ON CONFLICT (category) DO UPDATE SET user_id = $2`,
        [category, userId]
    );
}

async function pickRawLeader(category) {
    const candidates = await sortedCandidates(category);
    if (!candidates.length) return null;

    const topCount = candidates[0].count;
    const holder = await getHolder(category);
    const holderEntry = candidates.find(c => c.userId === holder);
    if (holderEntry && holderEntry.count === topCount) return holder; // ties keep the current holder

    return candidates[0].userId;
}

async function nextCandidateExcluding(category, excludeUserId) {
    const candidates = await sortedCandidates(category);
    const match = candidates.find(c => c.userId !== excludeUserId);
    return match ? match.userId : null;
}

// One person can never hold both roles. Resolves conflicts so whoever already holds a role
// keeps it; a brand-new conflict goes to whichever category they scored higher in.
async function resolveLeaders() {
    let uglyLeader = await pickRawLeader('ugly');
    let hotLeader = await pickRawLeader('hot');

    if (uglyLeader && uglyLeader === hotLeader) {
        const conflictUser = uglyLeader;
        const holderUgly = await getHolder('ugly');
        const holderHot = await getHolder('hot');

        if (holderUgly === conflictUser) {
            hotLeader = await nextCandidateExcluding('hot', conflictUser);
        } else if (holderHot === conflictUser) {
            uglyLeader = await nextCandidateExcluding('ugly', conflictUser);
        } else {
            const uglyCount = await bestCountForUser('ugly', conflictUser);
            const hotCount = await bestCountForUser('hot', conflictUser);
            if (uglyCount >= hotCount) {
                hotLeader = await nextCandidateExcluding('hot', conflictUser);
            } else {
                uglyLeader = await nextCandidateExcluding('ugly', conflictUser);
            }
        }
    }

    return { uglyLeader, hotLeader };
}

module.exports = { setCount, resolveLeaders, getHolder, setHolder, sortedCandidates };
