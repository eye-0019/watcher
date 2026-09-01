const {
    EmbedBuilder,
    ChannelType,
    PermissionFlagsBits
} = require('discord.js');

const { addMessageXp } = require('../utils/xpStore');
const { getResponse } = require('../utils/customCommandsStore');
const { trackMessage, TIMEOUT_MS } = require('../utils/antiSpam');

const {
    setTicket,
    getChannelForUser,
    getUserForChannel
} = require('../utils/dmTicketsStore');

const { isScamLink } =
    require('../utils/scamLinkFilter');

const { getAiReply } =
    require('../utils/aiChat');

// ============================================================
// Anti-spam exemptions
// ============================================================
//
// You can add more Discord user IDs here.
//
// The server owner is automatically exempt.
// You can also set:
// EXEMPT_USER_IDS=123,456,789
// in your environment variables.
//

const EXEMPT_USER_IDS = new Set([
    '1443431290492948611',

    ...(process.env.EXEMPT_USER_IDS || '')
        .split(',')
        .map(id => id.trim())
        .filter(Boolean)
]);

// ============================================================
// Create DM ticket channel
// ============================================================

async function getOrCreateTicketChannel(client, user) {
    const guildId =
        process.env.GUILD_ID;

    const guild =
        client.guilds.cache.get(guildId);

    if (!guild) {
        return null;
    }

    const existingId =
        await getChannelForUser(user.id);

    if (existingId) {
        const existing =
            guild.channels.cache.get(existingId);

        if (existing) {
            return existing;
        }
    }

    const overwrites = [
        {
            id: guild.roles.everyone.id,
            deny: [
                PermissionFlagsBits.ViewChannel
            ]
        }
    ];

    const staffRoleId =
        process.env.STAFF_ROLE_ID;

    if (staffRoleId) {
        overwrites.push({
            id: staffRoleId,

            allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages
            ]
        });
    }

    const channel =
        await guild.channels.create({
            name:
                `dm-${user.username}`
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, '')
                    .slice(0, 90) ||
                `dm-${user.id}`,

            type: ChannelType.GuildText,

            parent:
                process.env.MODMAIL_CATEGORY_ID ||
                undefined,

            permissionOverwrites:
                overwrites
        }).catch(error => {
            console.error(
                '❌ Failed to create DM ticket channel:',
                error
            );

            return null;
        });

    if (channel) {
        await setTicket(
            user.id,
            channel.id
        );
    }

    return channel;
}

// ============================================================
// Main message event
// ============================================================

module.exports = {
    name: 'messageCreate',

    async execute(message, client) {

        // ========================================================
        // Ignore bots
        // ========================================================

        if (message.author.bot) {
            return;
        }

        // ========================================================
        // Direct messages
        // ========================================================

        if (!message.guild) {

            const channel =
                await getOrCreateTicketChannel(
                    client,
                    message.author
                );

            if (!channel) {
                return;
            }

            const embed =
                new EmbedBuilder()
                    .setColor(0xFFFFFF)

                    .setAuthor({
                        name: message.author.tag,
                        iconURL:
                            message.author
                                .displayAvatarURL()
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

            await channel
                .send({ embeds: [embed] })
                .catch(error => {
                    console.error(
                        '❌ Failed to forward DM:',
                        error
                    );
                });

            return;
        }

        // ========================================================
        // Staff replying to an open DM ticket
        // ========================================================

        const ticketUserId =
            await getUserForChannel(
                message.channel.id
            );

        if (ticketUserId) {

            const user =
                await client.users
                    .fetch(ticketUserId)
                    .catch(() => null);

            if (user && message.content) {
                user
                    .send(message.content)
                    .catch(() => {});
            }

            return;
        }

        // ========================================================
        // AI CHAT
        // Only works in configured AI channel
        // AND when Watcher is mentioned
        // ========================================================

        const aiChannelId =
            process.env.AI_CHANNEL_ID;

        const watcherMentioned =
            message.mentions.has(client.user);

        if (
            aiChannelId &&
            message.channel.id === aiChannelId &&
            watcherMentioned
        ) {

            const userMessage =
                message.content
                    .replace(
                        new RegExp(
                            `<@!?${client.user.id}>`,
                            'g'
                        ),
                        ''
                    )
                    .trim();

            if (!userMessage) {

                await message
                    .reply('yo 😭 say something')
                    .catch(() => {});

                return;
            }

            try {

                await message.channel
                    .sendTyping();

                console.log(
                    `🤖 AI message from ${message.author.username} (${message.author.id})`
                );

                const reply =
                    await getAiReply(
                        message,
                        userMessage
                    );

                if (!reply) {

                    await message
                        .reply(
                            'uhh my brain is not working rn 😭 check the bot logs'
                        )
                        .catch(() => {});

                    return;
                }

                await message.reply(reply);

            } catch (error) {

                console.error(
                    '❌ AI message handling failed:',
                    error
                );

                await message
                    .reply(
                        'something broke on my end 😭'
                    )
                    .catch(() => {});
            }

            return;
        }

        // ========================================================
        // Scam/phishing links
        // ========================================================

        if (
            isScamLink(
                message.content
            )
        ) {

            await message
                .delete()
                .catch(() => {});

            return;
        }

        // ========================================================
        // Pics-only channel
        // ========================================================

        const picsChannelId =
            process.env.PICS_CHANNEL_ID;

        if (
            picsChannelId &&
            message.channel.id === picsChannelId
        ) {

            const hasImage =
                message.attachments.some(
                    attachment =>
                        attachment.contentType
                            ?.startsWith('image/')
                );

            if (!hasImage) {

                await message
                    .delete()
                    .catch(() => {});

            } else {

                message
                    .react('⬆️')
                    .then(() =>
                        message.react('⬇️')
                    )
                    .catch(() => {});
            }

            return;
        }

        // ========================================================
        // Anti-spam
        // ========================================================

        const isExempt =
            EXEMPT_USER_IDS.has(
                message.author.id
            );

        if (!isExempt) {

            const spamResult =
                trackMessage(
                    message.guild.id,
                    message.author.id
                );

            if (spamResult) {

                await message
                    .delete()
                    .catch(() => {});

                const member =
                    await message.guild.members
                        .fetch(message.author.id)
                        .catch(() => null);

                if (member?.moderatable) {

                    await member
                        .timeout(
                            TIMEOUT_MS,
                            'Auto anti-spam'
                        )
                        .catch(error => {
                            console.error(
                                '❌ Failed to timeout spammer:',
                                error
                            );
                        });
                }

                // Public callout
                await message.channel
                    .send(
                        `${message.author} bro chill 😭 you're sending messages way too fast.`
                    )
                    .then(sentMessage => {

                        setTimeout(() => {
                            sentMessage
                                .delete()
                                .catch(() => {});
                        }, 5000);

                    })
                    .catch(() => {});

                // Private DM
                await message.author
                    .send(
                        'yo 😭 you were sending messages too fast, so Watcher hit you with a short timeout. chill for a sec.'
                    )
                    .catch(() => {});

                return;
            }
        }

        // ========================================================
        // XP
        // ========================================================

        try {

            const xpResult =
                await addMessageXp(
                    message.author.id
                );

            if (
                xpResult?.leveledUp
            ) {

                await message.channel
                    .send(
                        `🎉 ${message.author} leveled up to **Level ${xpResult.newLevel}**!`
                    )
                    .catch(() => {});
            }

        } catch (error) {

            console.error(
                '❌ Failed to add message XP:',
                error
            );
        }

        // ========================================================
        // Custom commands
        // ========================================================

        try {

            const response =
                await getResponse(
                    message.content
                        .trim()
                        .split(/\s+/)[0]
                );

            if (response) {

                await message.channel
                    .send(response);
            }

        } catch (error) {

            console.error(
                '❌ Failed to process custom command:',
                error
            );
        }
    }
};
