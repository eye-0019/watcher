const { cacheGuildInvites } = require('../utils/inviteCache');

module.exports = {
    name: 'inviteDelete',
    async execute(invite) {
        await cacheGuildInvites(invite.guild);
    }
};
