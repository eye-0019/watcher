const { cacheGuildInvites } = require('../utils/inviteCache');
const { initDb } = require('../utils/db');
const {
    updateLiveLevelLeaderboard,
    updateLiveRatingLeaderboard
} = require('../utils/liveLeaderboard');

const LEADERBOARD_INTERVAL_MS = 60 * 1000;

module.exports = {
    name: 'clientReady',
    once: true,

    async execute(client) {
        console.log(`✅ Logged in as ${client.user.tag}`);

        // ========================================================
        // Database
        // ========================================================

        try {
            await initDb();
            console.log('✅ Database initialized.');
        } catch (error) {
            console.error('❌ Failed to initialize database:', error);
        }

        // ========================================================
        // Invite cache
        // ========================================================

        for (const guild of client.guilds.cache.values()) {
            try {
                await cacheGuildInvites(guild);
            } catch (error) {
                console.error(
                    `❌ Failed to cache invites for ${guild.name}:`,
                    error
                );
            }
        }

        // ========================================================
        // Initial leaderboard updates
        // ========================================================

        try {
            await updateLiveRatingLeaderboard(client);
        } catch (error) {
            console.error('❌ Failed to update rating leaderboard:', error);
        }

        try {
            await updateLiveLevelLeaderboard(client);
        } catch (error) {
            console.error('❌ Failed to update level leaderboard:', error);
        }

        // ========================================================
        // Keep leaderboards updated
        // ========================================================

        setInterval(async () => {
            try {
                await updateLiveLevelLeaderboard(client);
            } catch (error) {
                console.error(
                    '❌ Failed to update level leaderboard:',
                    error
                );
            }

            try {
                await updateLiveRatingLeaderboard(client);
            } catch (error) {
                console.error(
                    '❌ Failed to update rating leaderboard:',
                    error
                );
            }
        }, LEADERBOARD_INTERVAL_MS);

        console.log('✅ Watcher is fully ready.');
        console.log('🔄 Live leaderboards will refresh every 60 seconds.');
    }
};
