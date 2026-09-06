const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the kick')
        .setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const targetUser = interaction.options.getUser('target');
    const reason     = interaction.options.getString('reason') ?? 'No reason provided';
    const guild      = interaction.guild;
    const executor   = interaction.user;

    if (targetUser.id === executor.id) {
      return interaction.editReply({ content: 'You cannot kick yourself.' });
    }

    let targetMember;
    try {
      targetMember = await guild.members.fetch(targetUser.id);
    } catch {
      return interaction.editReply({ content: 'That user is not in this server.' });
    }

    if (!targetMember.kickable) {
      return interaction.editReply({
        content: 'I cannot kick that member — they may have a higher role than me.',
      });
    }

    const executorMember = await guild.members.fetch(executor.id);
    if (executor.id !== guild.ownerId && targetMember.roles.highest.position >= executorMember.roles.highest.position) {
      return interaction.editReply({
        content: 'You cannot kick someone with a role equal to or higher than yours.',
      });
    }

    try {
      await targetMember.kick(`${executor.tag} - ${reason}`);
    } catch (err) {
      console.error('[kick] kick failed:', err);
      return interaction.editReply({ content: `Failed to kick: ${err.message}` });
    }

    await interaction.editReply({
      content: `Successfully kicked **${targetUser.tag}**.\nReason: ${reason}`,
    });

    const logChannelId = process.env.KICK_LOG_CHANNEL;
    if (logChannelId) {
      (async () => {
        try {
          const logChannel = await guild.channels.fetch(logChannelId).catch(() => null);
          if (!logChannel?.isTextBased()) return;
          const embed = new EmbedBuilder()
            .setTitle('Member Kicked')
            .setColor(0xE67E22)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .addFields(
              { name: 'User',    value: `${targetUser.tag} (<@${targetUser.id}>)`, inline: true },
              { name: 'Mod',     value: `${executor.tag} (<@${executor.id}>)`,     inline: true },
              { name: 'Reason',  value: reason },
              { name: 'User ID', value: targetUser.id, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) ?? undefined });
          await logChannel.send({ embeds: [embed] });
        } catch (logErr) {
          console.error('[kick] Failed to send log embed:', logErr);
        }
      })();
    }
  },
};