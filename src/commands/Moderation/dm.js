const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setDmContext } = require('../../utils/dmContext');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dm')
        .setDescription('DM a user, their replies get forwarded to your logs channel')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to DM')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const message = interaction.options.getString('message');

        try {
            await target.send(message);
            setDmContext(target.id, interaction.guild.id);
            return interaction.reply({ content: `DM sent to ${target.tag}. Their replies will show up in your logs channel.`, ephemeral: true });
        } catch (err) {
            return interaction.reply({ content: `Could not DM ${target.tag}. They may have DMs closed.`, ephemeral: true });
        }
    }
};
