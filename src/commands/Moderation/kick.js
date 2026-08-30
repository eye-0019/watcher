const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { logAction } = require('../../utils/logAction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for kicking')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) {
            return interaction.reply({ content: 'Could not find that member.', ephemeral: true });
        }
        if (!target.kickable) {
            return interaction.reply({ content: 'I cannot kick that member.', ephemeral: true });
        }

        await target.kick(reason);
        await logAction(interaction.guild, {
            action: 'Member Kicked',
            moderator: interaction.user,
            target: target.user,
            reason,
            color: 0x95A5A6
        });

        return interaction.reply(`Kicked ${target.user.tag}. Reason: ${reason}`);
    }
};
