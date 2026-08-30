const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { addMessageXp } = require('../utils/xpStore');
const { getResponse } = require('../utils/customCommandsStore');
const { trackMessage, TIMEOUT_MS } = require('../utils/antiSpam');
const { setTicket, getChannelForUser, getUserForChannel } = require('../utils/dmTicketsStore');

async function getOrCreateTicketChannel(client, user) {
    const guildId = process.env.GUILD_ID;
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return null;

    const existingId = getChannelForUser(user.id);
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

    if (channel) setTicket(user.id, channel.id);
    return channel;
}

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;

        if (message.guild) {
            const ticketUserId = getUserForChannel(message.channel.id);
            if (ticketUserId) {
                const user = await client.users.fetch(ticketUserId).catch(() => null);
                if (user && message.content) {
                    user.send(message.content).catch(() => {});
                }
                return;
            }

            const isSpamming = trackMessage(message.guild.id, message.author.id);
            if (isSpamming) {
                message.delete().catch(() => {});

                const member = await message.guild.members.fetch(message.author.id).catch(() => null);
                if (member && member.moderatable) {
                    member.timeout(TIMEOUT_MS, 'Auto anti-spam').catch(() => {});
                }

                message.author.send("hey kid chill on the spaming im a lazy bot i dont wanna read all of ur dumb ah text u bum 💔").catch(() => {});

                const mainChannelId = process.env.MAIN_CHANNEL_ID;
                const mainChannel = mainChannelId ? message.guild.channels.cache.get(mainChannelId) : null;
                if (mainChannel) {
                    mainChannel.send(`${message.author} why did you spam can you stop? You're just giving me more work you bum`).catch(() => {});
                }

                return;
            }

            const result = addMessageXp(message.author.id);
            if (result && result.leveledUp) {
                message.channel.send(`🎉 ${message.author} leveled up to **level ${result.newLevel}**!`).catch(() => {});
            }

            const firstWord = message.content.trim().split(/\s+/)[0];
            if (firstWord) {
                const response = getResponse(firstWord);
                if (response) {
                    message.channel.send(response).catch(() => {});
                }
            }

            return;
        }

        const channel = await getOrCreateTicketChannel(client, message.author);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setColor(0xFFFFFF)
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setDescription(message.content?.slice(0, 1900) || '*No content*')
            .setFooter({ text: 'Reply in this channel to message them back' })
            .setTimestamp();

        channel.send({ embeds: [embed] }).catch(() => {});
    }
};
