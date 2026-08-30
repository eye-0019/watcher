const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { logAction } = require('../../utils/logAction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Remove timeout from a member')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to remove timeout from')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) {
            return interaction.reply({ content: 'Could not find that member.', ephemeral: true });
        }

        await target.timeout(null, reason);
        await logAction(interaction.guild, {
            action: 'Timeout Removed',
            moderator: interaction.user,
            target: target.user,
            reason,
            color: 0x95A5A6
        });

        return interaction.reply(`Removed timeout from ${target.user.tag}. Reason: ${reason}`);
    }
};
