const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(false))
    .addNumberOption(option =>
      option.setName('days')
        .setDescription('Number of days of messages to delete (0–7)')
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false)),

  async execute(interaction) {
    // Always defer first — prevents the 40060 "already acknowledged" error
    await interaction.deferReply({ flags: 64 });

    const targetUser = interaction.options.getUser('target');
    const reason     = interaction.options.getString('reason') ?? 'No reason provided';
    const days       = interaction.options.getNumber('days')   ?? 0;
    const guild      = interaction.guild;
    const executor   = interaction.user;

    // ── Permission / sanity checks ──────────────────────────────────────────
    if (targetUser.id === executor.id) {
      return interaction.editReply({ content: 'You cannot ban yourself.' });
    }
    if (targetUser.id === guild.ownerId) {
      return interaction.editReply({ content: 'You cannot ban the server owner.' });
    }

    // Try to fetch the member — they may have already left, and that's fine
    let targetMember = null;
    try {
      targetMember = await guild.members.fetch(targetUser.id);
    } catch {
      // User not in the guild — we can still ban by ID
    }

    // If they ARE in the guild, check role hierarchy
    if (targetMember) {
      if (!targetMember.bannable) {
        return interaction.editReply({
          content: 'I cannot ban that member. They may have a higher or equal role to mine.',
        });
      }
      const executorMember = await guild.members.fetch(executor.id);
      if (
        targetMember.roles.highest.position >=
        executorMember.roles.highest.position
      ) {
        return interaction.editReply({
          content: 'You cannot ban someone with a role equal to or higher than yours.',
        });
      }
    }

    // ── Attempt the ban ─────────────────────────────────────────────────────
    try {
      await guild.bans.create(targetUser.id, {
        reason: `${executor.tag} — ${reason}`,
        deleteMessageSeconds: days * 86400,
      });
    } catch (err) {
      console.error('[ban] guild.bans.create failed:', err);
      return interaction.editReply({
        content: `Failed to ban: ${err.message}`,
      });
    }

    // ── Reply to the moderator ───────────────────────────────────────────────
    await interaction.editReply({
      content: `Successfully banned **${targetUser.tag}**.\nReason: ${reason}`,
    });

    // ── Log to BAN_LOG_CHANNEL (non-blocking) ───────────────────────────────
    const logChannelId = process.env.BAN_LOG_CHANNEL;
    if (logChannelId) {
      (async () => {
        try {
          const logChannel = await guild.channels.fetch(logChannelId).catch(() => null);
          if (!logChannel?.isTextBased()) return;

          const embed = new EmbedBuilder()
            .setTitle('Member Banned')
            .setColor(0xE74C3C)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .addFields(
              { name: 'User',     value: `${targetUser.tag} (<@${targetUser.id}>)`, inline: true },
              { name: 'Mod',      value: `${executor.tag} (<@${executor.id}>)`,     inline: true },
              { name: 'Reason',   value: reason },
              { name: 'Msg Days Deleted', value: String(days), inline: true },
              { name: 'User ID',  value: targetUser.id, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) ?? undefined });

          await logChannel.send({ embeds: [embed] });
        } catch (logErr) {
          console.error('[ban] Failed to send log embed:', logErr);
        }
      })();
    }
  },
};
