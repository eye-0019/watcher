const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getWarnings } = require('../../utils/warningsStore');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View a member\'s warnings')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to check')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const warnings = getWarnings(target.id);

        if (warnings.length === 0) {
            return interaction.reply({ content: `${target.tag} has no warnings.`, ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`Warnings for ${target.tag}`)
            .setColor(0x95A5A6)
            .setDescription(
                warnings.map((w, i) => `**${i + 1}.** ${w.reason} — by ${w.moderator} (${new Date(w.date).toLocaleDateString()})`).join('\n')
            );

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
