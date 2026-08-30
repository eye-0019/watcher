const { cacheGuildInvites } = require('../utils/inviteCache');

module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}`);

        for (const guild of client.guilds.cache.values()) {
            await cacheGuildInvites(guild);
        }
    }
};
