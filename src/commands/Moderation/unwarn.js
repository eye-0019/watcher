const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { logAction } = require('../../utils/logAction');
const { removeLastWarning } = require('../../utils/warningsStore');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unwarn')
        .setDescription('Remove the most recent warning from a member')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to remove a warning from')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const target = interaction.options.getMember('target');

        if (!target) {
            return interaction.reply({ content: 'Could not find that member.', ephemeral: true });
        }

        const removed = removeLastWarning(target.id);
        if (!removed) {
            return interaction.reply({ content: `${target.user.tag} has no warnings to remove.`, ephemeral: true });
        }

        await logAction(interaction.guild, {
            action: 'Warning Removed',
            moderator: interaction.user,
            target: target.user,
            reason: 'Most recent warning removed',
            color: 0x95A5A6
        });

        return interaction.reply(`Removed the most recent warning from ${target.user.tag}.`);
    }
};
