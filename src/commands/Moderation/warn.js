const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { logAction } = require('../../utils/logAction');
const { addWarning } = require('../../utils/warningsStore');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a member')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for warning')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason');

        if (!target) {
            return interaction.reply({ content: 'Could not find that member.', ephemeral: true });
        }

        const count = addWarning(target.id, {
            reason,
            moderator: interaction.user.tag,
            date: new Date().toISOString()
        });

        await logAction(interaction.guild, {
            action: 'Member Warned',
            moderator: interaction.user,
            target: target.user,
            reason: `${reason} (warning #${count})`,
            color: 0x95A5A6
        });

        return interaction.reply(`Warned ${target.user.tag}. Total warnings: ${count}. Reason: ${reason}`);
    }
};
