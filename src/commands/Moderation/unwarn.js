const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unwarn')
    .setDescription('Remove a warning from a user by its ID.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addIntegerOption(option =>
      option.setName('warnid')
        .setDescription('The ID of the warning to remove (use /warnings to find it)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for removing the warning')
        .setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const warnId   = interaction.options.getInteger('warnid');
    const reason   = interaction.options.getString('reason') ?? 'No reason provided';
    const guild    = interaction.guild;
    const executor = interaction.user;

    let deleted;
    try {
      const res = await pool.query(
        'DELETE FROM warns WHERE id = $1 AND guild_id = $2 RETURNING *',
        [warnId, guild.id]
      );
      deleted = res.rows[0];
    } catch (err) {
      console.error('[unwarn] DB error:', err);
      return interaction.editReply({ content: 'Database error — could not remove warning.' });
    }

    if (!deleted) {
      return interaction.editReply({
        content: `No warning with ID **${warnId}** found in this server.`,
      });
    }

    // Fetch total remaining warns for that user
    let remaining = 0;
    try {
      const res = await pool.query(
        'SELECT COUNT(*) AS count FROM warns WHERE guild_id = $1 AND user_id = $2',
        [guild.id, deleted.user_id]
      );
      remaining = parseInt(res.rows[0].count, 10);
    } catch { /* not critical */ }

    await interaction.editReply({
      content: `Removed warning #${warnId}.\nUser: <@${deleted.user_id}> now has **${remaining}** warning(s).`,
    });

    // ── Log (non-blocking) ────────────────────────────────────────────────────
    const logChannelId = process.env.MOD_LOG_CHANNEL ?? process.env.BAN_LOG_CHANNEL;
    if (logChannelId) {
      (async () => {
        try {
          const logChannel = await guild.channels.fetch(logChannelId).catch(() => null);
          if (!logChannel?.isTextBased()) return;

          const embed = new EmbedBuilder()
            .setTitle('Warning Removed')
            .setColor(0x3498DB)
            .addFields(
              { name: 'Warning ID', value: String(warnId), inline: true },
              { name: 'User',       value: `<@${deleted.user_id}>`, inline: true },
              { name: 'Mod',        value: `${executor.tag} (<@${executor.id}>)`, inline: true },
              { name: 'Original Reason', value: deleted.reason },
              { name: 'Removal Reason',  value: reason },
              { name: 'Remaining Warns', value: String(remaining), inline: true },
            )
            .setTimestamp()
            .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) ?? undefined });

          await logChannel.send({ embeds: [embed] });
        } catch (logErr) {
          console.error('[unwarn] Failed to send log embed:', logErr);
        }
      })();
    }
  },
};
