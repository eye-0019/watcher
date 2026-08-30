const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboard } = require('../../utils/xpStore');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Show the top members by level/XP'),

    async execute(interaction) {
        const top = getLeaderboard(10);

        if (top.length === 0) {
            return interaction.reply('No one has earned any XP yet.');
        }

        const lines = top.map((u, i) => `**${i + 1}.** <@${u.userId}> — Level ${u.level} (${u.xp} XP)`);

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('🏆 Leaderboard')
            .setDescription(lines.join('\n'));

        return interaction.reply({ embeds: [embed] });
    }
};
