// ============================================================
// Watcher Context Engine v1
// Fetches everything happening in the server + IRL
// ============================================================

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// ============================================================
// RSS News Feed (free, no API key needed)
// ============================================================

async function getWorldNews() {
    try {
        const feeds = [
            'https://feeds.bbci.co.uk/news/world/rss.xml',
            'https://rss.reuters.com/reuters/worldNews'
        ];

        // try each feed until one works
        for (const feedUrl of feeds) {
            try {
                const res = await fetch(feedUrl, { signal: AbortSignal.timeout(5000) });
                const xml = await res.text();

                // parse headlines from RSS (no library needed)
                const titles = [...xml.matchAll(/<title><!\[CDATA\[(.+?)\]\]><\/title>|<title>(.+?)<\/title>/g)]
                    .map(m => (m[1] || m[2]).trim())
                    .filter(t => !t.toLowerCase().includes('bbc') && !t.toLowerCase().includes('reuters'))
                    .slice(0, 5);

                if (titles.length > 0) {
                    return `CURRENT WORLD NEWS:\n${titles.map(t => `- ${t}`).join('\n')}`;
                }
            } catch (e) {
                continue;
            }
        }

        return 'No news available right now.';
    } catch (e) {
        return 'No news available right now.';
    }
}

// ============================================================
// Online Members
// ============================================================

function getOnlineMembers(guild) {
    try {
        const online = guild.members.cache
            .filter(m => !m.user.bot && m.presence?.status && m.presence.status !== 'offline')
            .map(m => ({
                id: m.user.id,
                username: m.user.username,
                displayName: m.displayName,
                status: m.presence.status,
                roles: m.roles.cache
                    .filter(r => r.name !== '@everyone')
                    .map(r => r.name)
                    .join(', ') || 'no roles'
            }));

        if (online.length === 0) return 'No one is online right now.';

        return `ONLINE MEMBERS (${online.length}):\n` +
            online.map(m =>
                `- ${m.displayName} (@${m.username}, ID: ${m.id}) — ${m.status} — roles: ${m.roles}`
            ).join('\n');
    } catch (e) {
        return 'Could not fetch online members.';
    }
}

// ============================================================
// Recent joins
// ============================================================

function getRecentJoins(guild) {
    try {
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const recent = guild.members.cache
            .filter(m => !m.user.bot && m.joinedTimestamp > oneDayAgo)
            .map(m => `- ${m.displayName} (@${m.user.username}) joined recently`)
            .join('\n');

        return recent || 'No new members in the last 24 hours.';
    } catch (e) {
        return '';
    }
}

// ============================================================
// Server stats
// ============================================================

function getServerStats(guild) {
    try {
        const total = guild.memberCount;
        const bots = guild.members.cache.filter(m => m.user.bot).size;
        const humans = total - bots;
        const online = guild.members.cache.filter(m =>
            !m.user.bot && m.presence?.status && m.presence.status !== 'offline'
        ).size;
        const created = guild.createdAt.toDateString();

        return `SERVER STATS:
- Name: ${guild.name}
- Total members: ${total} (${humans} humans, ${bots} bots)
- Online right now: ${online}
- Server created: ${created}`;
    } catch (e) {
        return '';
    }
}

// ============================================================
// Pic leaderboard from DB
// ============================================================

async function getPicLeaderboard() {
    try {
        const result = await pool.query(`
            SELECT user_id, display_name, upvotes, downvotes,
                   (upvotes - downvotes) AS score
            FROM pic_ratings
            ORDER BY score DESC
            LIMIT 5
        `);

        if (result.rows.length === 0) return 'No pic ratings yet.';

        const rows = result.rows.map((r, i) =>
            `${i + 1}. ${r.display_name} (ID: ${r.user_id}) — ${r.upvotes} up / ${r.downvotes} down`
        ).join('\n');

        return `PIC LEADERBOARD (best looking):\n${rows}`;
    } catch (e) {
        return 'Could not load pic leaderboard.';
    }
}

// ============================================================
// Level leaderboard from DB
// ============================================================

async function getLevelLeaderboard() {
    try {
        const result = await pool.query(`
            SELECT user_id, username, level, xp
            FROM levels
            ORDER BY level DESC, xp DESC
            LIMIT 5
        `);

        if (result.rows.length === 0) return 'No level data yet.';

        const rows = result.rows.map((r, i) =>
            `${i + 1}. ${r.username} (ID: ${r.user_id}) — Level ${r.level} (${r.xp} XP)`
        ).join('\n');

        return `LEVEL LEADERBOARD:\n${rows}`;
    } catch (e) {
        return 'Could not load level leaderboard.';
    }
}

// ============================================================
// Recent moderation events from DB
// ============================================================

async function getRecentModEvents() {
    try {
        const result = await pool.query(`
            SELECT action, target_username, reason, created_at
            FROM mod_logs
            ORDER BY created_at DESC
            LIMIT 5
        `);

        if (result.rows.length === 0) return 'No recent mod actions.';

        const rows = result.rows.map(r =>
            `- ${r.action} on ${r.target_username}: ${r.reason || 'no reason'}`
        ).join('\n');

        return `RECENT MOD ACTIONS:\n${rows}`;
    } catch (e) {
        return '';
    }
}

// ============================================================
// Recent messages across all accessible channels
// ============================================================

async function getAllChannelContext(guild, currentChannelId) {
    try {
        const textChannels = guild.channels.cache.filter(c =>
            c.type === 0 && // GUILD_TEXT
            c.id !== currentChannelId &&
            c.permissionsFor(guild.members.me)?.has('ViewChannel') &&
            c.permissionsFor(guild.members.me)?.has('ReadMessageHistory')
        );

        const results = [];

        // grab last 3 messages from up to 5 other channels
        const channelsToCheck = [...textChannels.values()].slice(0, 5);

        for (const channel of channelsToCheck) {
            try {
                const messages = await channel.messages.fetch({ limit: 3 });
                const lines = Array.from(messages.values())
                    .reverse()
                    .map(m => `  ${m.author.username}: ${m.content}`)
                    .join('\n');

                if (lines.trim()) {
                    results.push(`#${channel.name}:\n${lines}`);
                }
            } catch (e) {
                continue;
            }
        }

        return results.length > 0
            ? `WHAT'S HAPPENING IN OTHER CHANNELS:\n${results.join('\n\n')}`
            : '';
    } catch (e) {
        return '';
    }
}

// ============================================================
// Day/time context
// ============================================================

function getTimeContext() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });

    let timeOfDay = '';
    if (hour >= 0 && hour < 5) timeOfDay = 'very late night / early morning (like why is anyone awake rn)';
    else if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';

    return `It is currently ${day}, ${timeOfDay}.`;
}

// ============================================================
// Build full server context block
// ============================================================

async function buildServerContext(message) {
    const guild = message.guild;

    const [
        news,
        picBoard,
        levelBoard,
        modEvents
    ] = await Promise.all([
        getWorldNews(),
        getPicLeaderboard(),
        getLevelLeaderboard(),
        getRecentModEvents()
    ]);

    // these are sync
    const onlineMembers = getOnlineMembers(guild);
    const recentJoins = getRecentJoins(guild);
    const serverStats = getServerStats(guild);
    const timeContext = getTimeContext();

    // this one needs await and is optional (don't block on failure)
    const channelContext = await getAllChannelContext(guild, message.channel.id)
        .catch(() => '');

    return `
${timeContext}

${serverStats}

${onlineMembers}

RECENT JOINS:
${recentJoins}

${picBoard}

${levelBoard}

${modEvents}

${channelContext}

${news}
`.trim();
}

module.exports = { buildServerContext };
