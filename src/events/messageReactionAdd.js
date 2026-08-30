const { getRoleId } = require('../utils/reactionRolesStore');
const { updateRatings } = require('../utils/ratingsTracker');

module.exports = {
    name: 'messageReactionAdd',
    async execute(reaction, user) {
        if (user.bot) return;

        if (reaction.partial) {
            try { await reaction.fetch(); } catch { return; }
        }

        // Pics-channel up/down vote rating (Ugliest/Good Looking roles)
        updateRatings(reaction).catch(() => {});

        const emojiKey = reaction.emoji.id ? `<:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name;
        const roleId = getRoleId(reaction.message.id, emojiKey);
        if (!roleId) return;

        const member = await reaction.message.guild.members.fetch(user.id).catch(() => null);
        if (!member) return;

        member.roles.add(roleId).catch(() => {});
    }
};
