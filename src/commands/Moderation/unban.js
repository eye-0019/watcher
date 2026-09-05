const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user from the server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(option =>
      option.setName('userid')
        .setDescription('The ID of the user to unban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the unban')
        .setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const userId   = interaction.options.getString('userid');
    const reason   = interaction.options.getString('reason') ?? 'No reason provided';
    const guild    = interaction.guild;
    const executor = interaction.user;

    if (!/^\d{17,20}$/.test(userId)) {
      return interaction.editReply({ content: 'That does not look like a valid Discord user ID.' });
    }

    let banEntry = null;
    try {
      banEntry = await guild.bans.fetch(userId);
    } catch {
      return interaction.editReply({ content: 'That user does not appear to be banned.' });
    }

    try {
      await guild.bans.remove(userId, `${executor.tag} - ${reason}`);
    } catch (err) {
      console.error('[unban] guild.bans.remove failed:', err);
      return interaction.editReply({ content: `Failed to unban: ${err.message}` });
    }

    const targetUser = banEntry.user;

    await interaction.editReply({
      content: `Successfully unbanned **${targetUser.tag}**.\nReason: ${reason}`,
    });

    const logChannelId = process.env.BAN_LOG_CHANNEL;
    if (logChannelId) {
      (async () => {
        try {
          const logChannel = await guild.channels.fetch(logChannelId).catch(() => null);
          if (!logChannel?.isTextBased()) return;
          const embed = new EmbedBuilder()
            .setTitle('Member Unbanned')
            .setColor(0x2ECC71)
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
          console.error('[unban] Failed to send log embed:', logErr);
        }
      })();
    }
  },
};