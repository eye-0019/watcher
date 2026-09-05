
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const DURATION_MAP = {
  '60s':  60,
  '5m':   300,
  '10m':  600,
  '30m':  1800,
  '1h':   3600,
  '6h':   21600,
  '12h':  43200,
  '1d':   86400,
  '3d':   259200,
  '7d':   604800,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout (mute) a member.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to timeout')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration of the timeout')
        .setRequired(true)
        .addChoices(
          { name: '60 seconds', value: '60s' },
          { name: '5 minutes',  value: '5m'  },
          { name: '10 minutes', value: '10m' },
          { name: '30 minutes', value: '30m' },
          { name: '1 hour',     value: '1h'  },
          { name: '6 hours',    value: '6h'  },
          { name: '12 hours',   value: '12h' },
          { name: '1 day',      value: '1d'  },
          { name: '3 days',     value: '3d'  },
          { name: '7 days',     value: '7d'  },
        ))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the timeout')
        .setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const targetUser  = interaction.options.getUser('target');
    const durationKey = interaction.options.getString('duration');
    const reason      = interaction.options.getString('reason') ?? 'No reason provided';
    const guild       = interaction.guild;
    const executor    = interaction.user;

    const seconds = DURATION_MAP[durationKey] ?? 300;

    if (targetUser.id === executor.id) {
      return interaction.editReply({ content: 'You cannot timeout yourself.' });
    }

    let targetMember;
    try {
      targetMember = await guild.members.fetch(targetUser.id);
    } catch {
      return interaction.editReply({ content: 'That user is not in this server.' });
    }

    if (!targetMember.moderatable) {
      return interaction.editReply({
        content: 'I cannot timeout that member — they may have a higher role than me.',
      });
    }

    const executorMember = await guild.members.fetch(executor.id);
    if (targetMember.roles.highest.position >= executorMember.roles.highest.position) {
      return interaction.editReply({
        content: 'You cannot timeout someone with a role equal to or higher than yours.',
      });
    }

    try {
      await targetMember.timeout(seconds * 1000, `${executor.tag} — ${reason}`);
    } catch (err) {
      console.error('[timeout] timeout failed:', err);
      return interaction.editReply({ content: `Failed to timeout: ${err.message}` });
    }

    const untilTimestamp = Math.floor(Date.now() / 1000) + seconds;

    await interaction.editReply({
      content: `Timed out **${targetUser.tag}** until <t:${untilTimestamp}:R>.\nReason: ${reason}`,
    });

    // ── Log (non-blocking) ─────────────────────────────────────────────────
    const logChannelId = process.env.MOD_LOG_CHANNEL ?? process.env.BAN_LOG_CHANNEL;
    if (logChannelId) {
      (async () => {
        try {
          const logChannel = await guild.channels.fetch(logChannelId).catch(() => null);
          if (!logChannel?.isTextBased()) return;

          const embed = new EmbedBuilder()
            .setTitle('Member Timed Out')
            .setColor(0x9B59B6)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .addFields(
              { name: 'User',     value: `${targetUser.tag} (<@${targetUser.id}>)`, inline: true },
              { name: 'Mod',      value: `${executor.tag} (<@${executor.id}>)`,     inline: true },
              { name: 'Duration', value: durationKey, inline: true },
              { name: 'Expires',  value: `<t:${untilTimestamp}:F>`, inline: true },
              { name: 'Reason',   value: reason },
              { name: 'User ID',  value: targetUser.id, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) ?? undefined });

          await logChannel.send({ embeds: [embed] });
        } catch (logErr) {
          console.error('[timeout] Failed to send log embed:', logErr);
        }
      })();
    }
  },
};
