const { EmbedBuilder } = require('discord.js');
const { pool } = require('../utils/db');

const LEAVE_MESSAGES = [
    'Goodbye {user}! Hope to see you again. ❤️',
    '{user} has left the server.',
    'See you later, {user}! 😌',
    '{user} headed out. Take care!',
    'Goodbye {user}. We will miss you. 😢',
    '{user} has left the server. Take care!',
    'Looks like {user} is heading out. 👀',
    '{user} has left. Goodbye!',
    'See you around, {user}! 🥲',
    '{user} is off to somewhere else.'
];

function getRandomLeaveMessage(user) {
    const message =
        LEAVE_MESSAGES[
            Math.floor(Math.random() * LEAVE_MESSAGES.length)
        ];

    return message.replace('{user}', user);
}

module.exports = {
    name: 'guildMemberRemove',

    async execute(member) {
        try {
            const leaveChannelId =
                process.env.WELCOME_CHANNEL_ID;

            if (leaveChannelId) {
                const channel =
                    member.guild.channels.cache.get(
                        leaveChannelId
                    );

                if (channel && channel.isTextBased()) {
                    const leaveMessage =
                        getRandomLeaveMessage(
                            member.user.tag
                        );

                    const embed =
                        new EmbedBuilder()
                            .setColor(0xed4245)
                            .setDescription(
                                leaveMessage
                            )
                            .setTimestamp();

                    await channel.send({
                        embeds: [embed]
                    });
                }
            }

            await pool.query(
                `
                UPDATE member_joins
                SET left_at = NOW()
                WHERE user_id = $1
                  AND guild_id = $2
                  AND left_at IS NULL
                `,
                [
                    member.id,
                    member.guild.id
                ]
            );

        } catch (error) {
            console.error(
                `[Leave] Error handling ${member.user.tag} leaving ${member.guild.name}:`,
                error
            );
        }
    }
};
