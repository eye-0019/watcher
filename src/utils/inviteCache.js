const inviteCache = new Map();

async function cacheGuildInvites(guild) {
    try {
        const invites = await guild.invites.fetch();

        const usageMap = new Map();

        invites.forEach(invite => {
            usageMap.set(invite.code, invite.uses);
        });

        inviteCache.set(guild.id, usageMap);

    } catch (error) {
        console.error(
            `[inviteCache] Failed to cache invites for ${guild.id}:`,
            error.message
        );
    }
}


function getCachedInvites(guildId) {
    return inviteCache.get(guildId) || new Map();
}


module.exports = {
    cacheGuildInvites,
    getCachedInvites
};