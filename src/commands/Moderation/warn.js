const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

pool.query(`
  CREATE TABLE IF NOT EXISTS warns (
    id         SERIAL PRIMARY KEY,
    guild_id   TEXT NOT NULL,
    user_id    TEXT NOT NULL,
    mod_id     TEXT NOT NULL,
    reason     TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`).catch(err => console.error('[warn] Failed to ensure warns table:', err));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to warn')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the warning')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const targetUser = interaction.options.getUser('target');
    const reason     = interaction.options.getString('reason');
    const guild      = interaction.guild;
    const executor   = interaction.user;

    if (targetUser.id === executor.id) {
      return interaction.editReply({ content: 'You cannot warn yourself.' });
    }
    if (targetUser.bot) {
      return interaction.editReply({ content: 'You cannot warn a bot.' });
    }

    let warnCount;
    try {
      await pool.query(
        'INSERT INTO warns (guild_id, user_id, mod_id, reason) VALUES ($1, $2, $3, $4)',
        [guild.id, targetUser.id, executor.id, reason]
      );
      const res = await pool.query(
        'SELECT COUNT(*) AS count FROM warns WHERE guild_id = $1 AND user_id = $2',
        [guild.id, targetUser.id]
      );
      warnCount = parseInt(res.rows[0].count, 10);
    } catch (err) {
      console.error('[warn] DB error:', err);
      return interaction.editReply({ content: 'Database error - warn was not saved.' });
    }

    await interaction.editReply({
      content: `Warned **${targetUser.tag}** (warn #${warnCount}).\nReason: ${reason}`,
    });

    (async () => {
      try {
        await targetUser.send(
          `You have been warned in **${guild.name}**.\nReason: ${reason}\nTotal warnings: ${warnCount}`
        );
      } catch { /* DMs closed */ }
    })();

    const logChannelId = process.env.WARN_LOG_CHANNEL;
    if (logChannelId) {
      (async () => {
        try {
          const logChannel = await guild.channels.fetch(logChannelId).catch(() => null);
          if (!logChannel?.isTextBased()) return;
          const embed = new EmbedBuilder()
            .setTitle('Member Warned')
            .setColor(0x2B2D31)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .addFields(
              { name: 'User',           value: `${targetUser.tag} (<@${targetUser.id}>)`, inline: true },
              { name: 'Mod',            value: `${executor.tag} (<@${executor.id}>)`,     inline: true },
              { name: 'Reason',         value: reason },
              { name: 'Total Warnings', value: String(warnCount), inline: true },
              { name: 'User ID',        value: targetUser.id, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) ?? undefined });
          await logChannel.send({ embeds: [embed] });
        } catch (logErr) {
          console.error('[warn] Failed to send log embed:', logErr);
        }
      })();
    }
  },
};