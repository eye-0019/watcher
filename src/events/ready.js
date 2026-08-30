const { cacheGuildInvites } = require('../utils/inviteCache');
const { initDb } = require('../utils/db');
const { updateLiveLevelLeaderboard, updateLiveRatingLeaderboard } = require('../utils/liveLeaderboard');

const LEVEL_LEADERBOARD_INTERVAL_MS = 60 * 1000; // refresh every 60 seconds

module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}`);

        await initDb().catch(err => console.error('Failed to initialize database:', err));

        for (const guild of client.guilds.cache.values()) {
            await cacheGuildInvites(guild);
        }

        updateLiveRatingLeaderboard(client).catch(() => {});
        updateLiveLevelLeaderboard(client).catch(() => {});

        setInterval(() => {
            updateLiveLevelLeaderboard(client).catch(() => {});
        }, LEVEL_LEADERBOARD_INTERVAL_MS);
    }
};
