const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { addMessageXp } = require('../utils/xpStore');
const { getResponse } = require('../utils/customCommandsStore');
const { trackMessage, TIMEOUT_MS } = require('../utils/antiSpam');
const { setTicket, getChannelForUser, getUserForChannel } = require('../utils/dmTicketsStore');
const { isScamLink } = require('../utils/scamLinkFilter');
const { getAiReply } = require('../utils/aiChat');

const ANTI_SPAM_MESSAGES = [
    'bro chill 😭',
    'Slow down, you are sending messages way too fast.',
    'okay we get it 💀',
    'Please stop spamming.',
    'my guy relax 😤',
    'Take it easy for a second.',
    'bro is fighting the send button 🤦',
    'You are sending messages too quickly.',
    'why are you sending all that 😭',
    'Give the server a second.'
];

function getRandomAntiSpamMessage() {
    return ANTI_SPAM_MESSAGES[
        Math.floor(Math.random() * ANTI_SPAM_MESSAGES.length)
    ];
}

const LEVEL_UP_MESSAGES = [
    '{user} just reached **level {level}**! 😼',
    'Nice, {user}! You are now **level {level}**.',
    '{user} hit **level {level}**. Keep going! 🗣️',
    'Look at {user} reaching **level {level}**.',
    '{user} is now **level {level}**! 👀',
    '{user} reached **level {level}**.',
    'You made it to **level {level}**, {user}!',
    '{user} just leveled up to **level {level}**! 😭',
    '**Level {level}** unlocked for {user}.',
    '{user} is officially **level {level}**. ☝️'
];

function getRandomLevelUpMessage(user, level) {
    const message =
        LEVEL_UP_MESSAGES[
            Math.floor(Math.random() * LEVEL_UP_MESSAGES.length)
        ];

    return message
        .replaceAll('{user}', user)
        .replaceAll('{level}', level);
}

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
        {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
        }
    ];

    const staffRoleId = process.env.STAFF_ROLE_ID;

    if (staffRoleId) {
        overwrites.push({
            id: staffRoleId,
            allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages
            ]
        });
    }

    const channel = await guild.channels.create({
        name: `dm-${user.username}`
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '')
            .slice(0, 90) || `dm-${user.id}`,
        type: ChannelType.GuildText,
        parent: process.env.MODMAIL_CATEGORY_ID || undefined,
        permissionOverwrites: overwrites
    }).catch(() => null);

    if (channel) {
        await setTicket(user.id, channel.id);
    }

    return channel;
}

module.exports = {
    name: 'messageCreate',

    async execute(message, client) {
        if (message.author.bot) return;

        if (message.guild) {
            const ticketUserId = await getUserForChannel(message.channel.id);

            if (ticketUserId) {
                const user = await client.users
                    .fetch(ticketUserId)
                    .catch(() => null);

                if (user && message.content) {
                    user.send(message.content).catch(() => {});
                }

                return;
            }

            const aiChannelId = process.env.AI_CHANNEL_ID;

            if (
                aiChannelId &&
                message.channel.id === aiChannelId &&
                message.mentions.has(client.user)
            ) {
                const cleanContent = message.content
                    .replace(/<@!?\d+>/g, '')
                    .trim();

                const reply = await getAiReply(cleanContent);

                if (reply) {
                    message.channel.send(reply).catch(() => {});
                }

                return;
            }

            if (isScamLink(message.content)) {
                message.delete().catch(() => {});
                return;
            }

            const picsChannelId = process.env.PICS_CHANNEL_ID;

            if (
                picsChannelId &&
                message.channel.id === picsChannelId
            ) {
                const hasImage = message.attachments.some(
                    a => a.contentType?.startsWith('image/')
                );

                if (!hasImage) {
                    message.delete().catch(() => {});
                } else {
                    message
                        .react('⬆️')
                        .then(() => message.react('⬇️'))
                        .catch(() => {});
                }

                return;
            }

            const exemptIds = (process.env.EXEMPT_USER_IDS || '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);

            const isExempt = exemptIds.includes(message.author.id);

            const isSpamming =
                !isExempt &&
                trackMessage(
                    message.guild.id,
                    message.author.id
                );

            if (isSpamming) {
                message.delete().catch(() => {});

                const member = await message.guild.members
                    .fetch(message.author.id)
                    .catch(() => null);

                if (member && member.moderatable) {
                    member
                        .timeout(
                            TIMEOUT_MS,
                            'Auto anti-spam'
                        )
                        .catch(() => {});
                }

                const randomMessage =
                    getRandomAntiSpamMessage();

                message.author
                    .send(randomMessage)
                    .catch(() => {});

                const mainChannelId =
                    process.env.MAIN_CHANNEL_ID;

                const mainChannel = mainChannelId
                    ? message.guild.channels.cache.get(
                        mainChannelId
                    )
                    : null;

                if (mainChannel) {
                    mainChannel
                        .send(
                            `${message.author} ${randomMessage}`
                        )
                        .catch(() => {});
                }

                return;
            }

            const result = await addMessageXp(
                message.author.id
            );

            if (result && result.leveledUp) {
                const levelUpMessage =
                    getRandomLevelUpMessage(
                        message.author.toString(),
                        result.newLevel
                    );

                message.channel
                    .send(levelUpMessage)
                    .catch(() => {});
            }

            const firstWord = message.content
                .trim()
                .split(/\s+/)[0];

            if (firstWord) {
                const response =
                    await getResponse(firstWord);

                if (response) {
                    message.channel
                        .send(response)
                        .catch(() => {});
                }
            }

            return;
        }

        const channel =
            await getOrCreateTicketChannel(
                client,
                message.author
            );

        if (!channel) return;

        const embed = new EmbedBuilder()
            .setColor(0xFFFFFF)
            .setAuthor({
                name: message.author.tag,
                iconURL:
                    message.author.displayAvatarURL()
            })
            .setDescription(
                message.content?.slice(0, 1900) ||
                '*No content*'
            )
            .setFooter({
                text:
                    'Reply in this channel to message them back'
            })
            .setTimestamp();

        channel
            .send({ embeds: [embed] })
            .catch(() => {});
    }
};
