const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { addMessageXp } = require('../utils/xpStore');
const { getResponse } = require('../utils/customCommandsStore');
const { trackMessage, TIMEOUT_MS } = require('../utils/antiSpam');
const { setTicket, getChannelForUser, getUserForChannel } = require('../utils/dmTicketsStore');
const { isScamLink } = require('../utils/scamLinkFilter');

async function getOrCreateTicketChannel(client, user) {
    const guildId = process.env.GUILD_ID;
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return null;

    const existingId = await getChannelForUser(user.id);
    if (existingId) {
        const existing = guild.channels.cache.get(existingId);
        if (existing) return existing;
    }

    const overwrites = [
        { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] }
    ];
    const staffRoleId = process.env.STAFF_ROLE_ID;
    if (staffRoleId) {
        overwrites.push({ id: staffRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] });
    }

    const channel = await guild.channels.create({
        name: `dm-${user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 90) || `dm-${user.id}`,
        type: ChannelType.GuildText,
        parent: process.env.MODMAIL_CATEGORY_ID || undefined,
        permissionOverwrites: overwrites
    }).catch(() => null);

    if (channel) await setTicket(user.id, channel.id);
    return channel;
}

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;

        if (message.guild) {
            // If this channel is an open DM ticket, forward whatever staff types back to the user's DMs
            const ticketUserId = await getUserForChannel(message.channel.id);
            if (ticketUserId) {
                const user = await client.users.fetch(ticketUserId).catch(() => null);
                if (user && message.content) {
                    user.send(message.content).catch(() => {});
                }
                return;
            }

            // Scam/phishing links: delete on sight, no timeout
            if (isScamLink(message.content)) {
                message.delete().catch(() => {});
                return;
            }

            // Pics-only channel: delete anything without an image, react to add up/down voting on images
            const picsChannelId = process.env.PICS_CHANNEL_ID;
            if (picsChannelId && message.channel.id === picsChannelId) {
                const hasImage = message.attachments.some(a => a.contentType?.startsWith('image/'));
                if (!hasImage) {
                    message.delete().catch(() => {});
                } else {
                    message.react('⬆️').then(() => message.react('⬇️')).catch(() => {});
