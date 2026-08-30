const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { logAction } = require('../../utils/logAction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for banning')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) {
            return interaction.reply({ content: 'Could not find that member.', ephemeral: true });
        }
        if (!target.bannable) {
            return interaction.reply({ content: 'I cannot ban that member.', ephemeral: true });
        }

        await target.ban({ reason });
        await logAction(interaction.guild, {
            action: 'Member Banned',
            moderator: interaction.user,
            target: target.user,
            reason,
            color: 0x95A5A6
        });

        return interaction.reply(`Banned ${target.user.tag}. Reason: ${reason}`);
    }
};
