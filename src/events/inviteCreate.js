const { cacheGuildInvites } = require('../utils/inviteCache');

module.exports = {
    name: 'inviteCreate',
    async execute(invite) {
        await cacheGuildInvites(invite.guild);
    }
};
