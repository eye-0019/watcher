const { loadData, setCount, resolveLeaders, setHolder } = require('./ratingsStore');

// Called whenever an up/down reaction is added or removed on a message in the pics channel.
// Recomputes both title-holders (they can never be the same person) and swaps roles as needed.
async function updateRatings(reaction) {
    if (reaction.partial) {
        try { await reaction.fetch(); } catch { return; }
    }

    let message = reaction.message;
    if (message.partial) {
        try { message = await message.fetch(); } catch { return; }
    }
    if (!message.guild) return;

    const picsChannelId = process.env.PICS_CHANNEL_ID;
    if (!picsChannelId || message.channel.id !== picsChannelId) return;

    const emoji = reaction.emoji.name;
    if (emoji !== '⬆️' && emoji !== '⬇️') return;

    const category = emoji === '⬇️' ? 'ugly' : 'hot';
    const uglyRoleId = process.env.UGLY_ROLE_ID;
    const hotRoleId = process.env.HOT_ROLE_ID;
    if (!uglyRoleId || !hotRoleId) return;

    const count = Math.max(0, reaction.count - 1); // exclude the bot's own reaction
    const data = setCount(category, message.id, message.author.id, count);

    const oldUglyHolder = data.ugly.holder;
    const oldHotHolder = data.hot.holder;

    const { uglyLeader, hotLeader } = resolveLeaders(data);

    if (uglyLeader !== oldUglyHolder) {
        if (oldUglyHolder) {
            const oldMember = await message.guild.members.fetch(oldUglyHolder).catch(() => null);
            if (oldMember) oldMember.roles.remove(uglyRoleId).catch(() => {});
        }
        if (uglyLeader) {
            const newMember = await message.guild.members.fetch(uglyLeader).catch(() => null);
            if (newMember) newMember.roles.add(uglyRoleId).catch(() => {});
        }
        setHolder('ugly', uglyLeader, data);
    }

    if (hotLeader !== oldHotHolder) {
        if (oldHotHolder) {
            const oldMember = await message.guild.members.fetch(oldHotHolder).catch(() => null);
            if (oldMember) oldMember.roles.remove(hotRoleId).catch(() => {});
        }
        if (hotLeader) {
            const newMember = await message.guild.members.fetch(hotLeader).catch(() => null);
            if (newMember) newMember.roles.add(hotRoleId).catch(() => {});
        }
        setHolder('hot', hotLeader, data);
    }
}

module.exports = { updateRatings };
