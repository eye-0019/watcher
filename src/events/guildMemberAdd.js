const { EmbedBuilder } = require('discord.js');
const { pool } = require('../utils/db');
const { recordJoin } = require('../utils/raidGuard');

const WELCOME_MESSAGES = [
  'Welcome {user} to the server! 👀',
  'Hey {user}, welcome to the server!',
  'Welcome {user}! Glad to have you here. ❤️',
  '{user} just joined. Welcome!',
  'Everyone say hi to {user}! 🗣️',
  'Hey {user}! Hope you enjoy your time here.',
  '{user} has arrived. Welcome! 😼',
  'Welcome in, {user}!',
  '{user} just pulled up. Welcome! 👌',
  'Welcome {user}! Make yourself at home.'
];

function getRandomWelcomeMessage(user) {
  const message =
    WELCOME_MESSAGES[
      Math.floor(Math.random() * WELCOME_MESSAGES.length)
    ];

  return message.replace('{user}', user);
}

module.exports = {
  name: 'guildMemberAdd',

  async execute(member) {
    try {
      const newlyDetected = recordJoin(member.guild.id);

      if (newlyDetected) {
        console.log(
          `[RaidGuard] Raid detected in ${member.guild.name}`
        );
      }

      const welcomeChannelId =
        process.env.WELCOME_CHANNEL_ID;

      if (welcomeChannelId) {
        const channel =
          member.guild.channels.cache.get(
            welcomeChannelId
          );

        if (channel && channel.isTextBased()) {
          const welcomeMessage =
            getRandomWelcomeMessage(
              member.toString()
            );

          const embed =
            new EmbedBuilder()
              .setColor(0x5865f2)
              .setDescription(welcomeMessage)
              .setTimestamp();

          await channel.send({
            embeds: [embed]
          });
        }
      }

      const autoRoleId =
        process.env.AUTO_ROLE_ID;

      if (autoRoleId) {
        const role =
          member.guild.roles.cache.get(autoRoleId);

        if (role) {
          try {
            await member.roles.add(role);
          } catch (error) {
            console.error(
              `[Welcome] Failed to add auto role to ${member.user.tag}:`,
              error
            );
          }
        }
      }

      await pool.query(
        `
        INSERT INTO member_joins (user_id, guild_id, joined_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT DO NOTHING
        `,
        [
          member.id,
          member.guild.id
        ]
      );

    } catch (error) {
      console.error(
        `[Welcome] Error handling ${member.user.tag} joining ${member.guild.name}:`,
        error
      );
    }
  }
};
