const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, xpForLevel } = require('../../utils/xpStore');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Check your (or someone else\'s) level and XP')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Whose rank to check')
                .setRequired(false)),

    async execute(interaction) {
        const target = interaction.options.getUser('target') || interaction.user;
        const user = await getUser(target.id);

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setAuthor({ name: target.tag, iconURL: target.displayAvatarURL() })
            .addFields(
                { name: 'Level', value: `${user.level}`, inline: true },
                { name: 'XP', value: `${user.xp} / ${xpForLevel(user.level)}`, inline: true }
            );

        return interaction.reply({ embeds: [embed] });
    }
};
