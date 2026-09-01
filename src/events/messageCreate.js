const {
    EmbedBuilder,
    ChannelType,
    PermissionFlagsBits
} = require('discord.js');

const { addMessageXp } = require('../utils/xpStore');
const { getResponse } = require('../utils/customCommandsStore');
const {
    trackMessage,
    TIMEOUT_MS
} = require('../utils/antiSpam');
const {
    setTicket,
    getChannelForUser,
    getUserForChannel
} = require('../utils/dmTicketsStore');
const { isScamLink } = require('../utils/scamLinkFilter');
const { getAiReply } = require('../utils/aiChat');

// ============================================================
// Modmail / DM ticket helpers
// ============================================================

async function getOrCreateTicketChannel(client, user) {
    const guildId = process.env.GUILD_ID;

    if (!guildId) {
        console.error('❌ GUILD_ID is not configured.');
        return null;
    }

    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
        console.error(`❌ Could not find guild ${guildId}.`);
        return null;
    }

    // Reuse existing ticket if one exists
    const existingId = await getChannelForUser(user.id);

    if (existingId) {
        const existing = guild.channels.cache.get(existingId);

        if (existing) {
            return existing;
        }
    }

    // Create permission overwrites
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

    // Create ticket channel
    const channelName =
        `dm-${user.username}`
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '')
            .slice(0, 90) || `dm-${user.id}`;

    const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: process.env.MODMAIL_CATEGORY_ID || undefined,
        permissionOverwrites: overwrites
    }).catch(error => {
        console.error('❌ Failed to create DM ticket channel:', error);
        return null;
    });

    if (channel) {
        await setTicket(user.id, channel.id);
    }

    return channel;
}

// ============================================================
// Staff reply handler
// ============================================================

async function handleTicketMessage(message, client) {
    const ticketUserId = await getUserForChannel(message.channel.id);

    if (!ticketUserId) {
        return false;
    }

    const user = await client.users
        .fetch(ticketUserId)
        .catch(() => null);

    if (user && message.content) {
        user.send(message.content).catch(() => {});
    }

    return true;
}

// ============================================================
// AI chat handler
// ============================================================

async function handleAiMessage(message, client) {
    const aiChannelId = process.env.AI_CHANNEL_ID;

    if (
        !aiChannelId ||
        message.channel.id !== aiChannelId ||
        !message.mentions.has(client.user)
    ) {
        return false;
    }

    const cleanContent = message.content
        .replace(/<@!?\d+>/g, '')
        .trim();

    if (!cleanContent) {
        return true;
    }

    try {
        const reply = await getAiReply(cleanContent);

        if (reply) {
            await message.channel.send(reply).catch(() => {});
        }
    } catch (error) {
        console.error('❌ AI reply failed:', error);
    }

    return true;
}

// ============================================================
// Scam link handler
// ============================================================

async function handleScamLink(message) {
    if (!isScamLink(message.content)) {
        return false;
    }

    await message.delete().catch(() => {});
    return true;
}

// ============================================================
// Pics-only channel handler
// ============================================================

async function handlePicsChannel(message) {
    const picsChannelId = process.env.PICS_CHANNEL_ID;

    if (
        !picsChannelId ||
        message.channel.id !== picsChannelId
    ) {
        return false;
    }

    const hasImage = message.attachments.some(attachment =>
        attachment.contentType?.startsWith('image/')
    );

    if (!hasImage) {
        await message.delete().catch(() => {});
    } else {
        await message.react('⬆️').catch(() => {});
        await message.react('⬇️').catch(() => {});
    }

    return true;
}

// ============================================================
// Anti-spam handler
// ============================================================

async function handleAntiSpam(message) {
    const exemptIds = (process.env.EXEMPT_USER_IDS || '')
        .split(',')
        .map(id => id.trim())
        .filter(Boolean);

    const isExempt = exemptIds.includes(message.author.id);

    const isSpamming =
        !isExempt &&
        trackMessage(
            message.guild.id,
            message.author.id
        );

    if (!isSpamming) {
        return false;
    }

    // Delete spam message
    await message.delete().catch(() => {});

    // Timeout member
    const member = await message.guild.members
        .fetch(message.author.id)
        .catch(() => null);

    if (member?.moderatable) {
        await member
            .timeout(TIMEOUT_MS, 'Auto anti-spam')
            .catch(error => {
                console.error(
                    '❌ Failed to timeout spammer:',
                    error
                );
            });
    }

    // DM the user
    message.author
        .send(
            "hey kid chill on the spaming im a lazy bot i dont wanna read all of ur dumb ah text u bum"
        )
        .catch(() => {});

    // Notify main channel
    const mainChannelId = process.env.MAIN_CHANNEL_ID;

    if (mainChannelId) {
        const mainChannel = message.guild.channels.cache.get(
            mainChannelId
        );

        if (mainChannel) {
            mainChannel
                .send(
                    `${message.author} why did you spam can you stop? You're just giving me more work you bum`
                )
                .catch(() => {});
        }
    }

    return true;
}

// ============================================================
// XP handler
// ============================================================

async function handleXp(message) {
    try {
        const result = await addMessageXp(message.author.id);

        if (result?.leveledUp) {
            await message.channel
                .send(
                    `${message.author} leveled up to **level ${result.newLevel}**!`
                )
                .catch(() => {});
        }
    } catch (error) {
        console.error('❌ Failed to add message XP:', error);
    }
}

// ============================================================
// Custom command handler
// ============================================================

async function handleCustomCommand(message) {
    const firstWord = message.content
        .trim()
        .split(/\s+/)[0];

    if (!firstWord) {
        return;
    }

    try {
        const response = await getResponse(firstWord);

        if (response) {
            await message.channel
                .send(response)
                .catch(() => {});
        }
    } catch (error) {
        console.error(
            '❌ Failed to process custom command:',
            error
        );
    }
}

// ============================================================
// DM handler
// ============================================================

async function handleDirectMessage(message, client) {
    const channel = await getOrCreateTicketChannel(
        client,
        message.author
    );

    if (!channel) {
        return;
    }

    const embed = new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setAuthor({
            name: message.author.tag,
            iconURL: message.author.displayAvatarURL()
        })
        .setDescription(
            message.content?.slice(0, 1900) || '*No content*'
        )
        .setFooter({
            text: 'Reply in this channel to message them back'
        })
        .setTimestamp();

    await channel
        .send({ embeds: [embed] })
        .catch(error => {
            console.error(
                '❌ Failed to forward DM to ticket:',
                error
            );
        });
}

// ============================================================
// Main message event
// ============================================================

module.exports = {
    name: 'messageCreate',

    async execute(message, client) {
        // Ignore bots
        if (message.author.bot) {
            return;
        }

        // ========================================================
        // Direct messages
        // ========================================================

        if (!message.guild) {
            await handleDirectMessage(message, client);
            return;
        }

        // ========================================================
        // Staff replying to a DM ticket
        // ========================================================

        if (await handleTicketMessage(message, client)) {
            return;
        }

        // ========================================================
        // AI chat
        // ========================================================

        if (await handleAiMessage(message, client)) {
            return;
        }

        // ========================================================
        // Scam links
        // ========================================================

        if (await handleScamLink(message)) {
            return;
        }

        // ========================================================
        // Pics-only channel
        // ========================================================

        if (await handlePicsChannel(message)) {
            return;
        }

        // ========================================================
        // Anti-spam
        // ========================================================

        if (await handleAntiSpam(message)) {
            return;
        }

        // ========================================================
        // XP / leveling
        // ========================================================

        await handleXp(message);

        // ========================================================
        // Custom commands
        // ========================================================

        await handleCustomCommand(message);
    }
};
