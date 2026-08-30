const { getRoleId } = require('../utils/reactionRolesStore');

module.exports = {
    name: 'messageReactionAdd',
    async execute(reaction, user) {
        if (user.bot) return;

        if (reaction.partial) {
            try { await reaction.fetch(); } catch { return; }
        }

        const emojiKey = reaction.emoji.id ? `<:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name;
        const roleId = getRoleId(reaction.message.id, emojiKey);
        if (!roleId) return;

        const member = await reaction.message.guild.members.fetch(user.id).catch(() => null);
        if (!member) return;

        member.roles.add(roleId).catch(() => {});
    }
};
