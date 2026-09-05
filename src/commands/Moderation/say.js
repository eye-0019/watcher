const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Make the bot say something.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(option =>
      option.setName('message')
        .setDescription('What the bot should say')
        .setRequired(true)),

  async execute(interaction) {
    const message = interaction.options.getString('message');
    await interaction.deferReply({ flags: 64 });
    await interaction.channel.send(message);
    await interaction.editReply({ content: 'Sent.' });
  },
};