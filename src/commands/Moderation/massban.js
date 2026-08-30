const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { logAction } = require('../../utils/logAction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('massban')
        .setDescription('Ban multiple users by ID (space-separated)')
        .addStringOption(option =>
            option.setName('userids')
                .setDescription('User IDs separated by spaces')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for banning')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const ids = interaction.options.getString('userids').split(/\s+/).filter(Boolean);
        const reason = interaction.options.getString('reason') || 'No reason provided';

        await interaction.deferReply();

        let success = 0;
        let failed = 0;

        for (const id of ids) {
            try {
                await interaction.guild.bans.create(id, { reason });
                success++;
            } catch {
                failed++;
            }
        }

        await logAction(interaction.guild, {
            action: 'Mass Ban',
            moderator: interaction.user,
            target: interaction.user,
            reason: `${success} banned, ${failed} failed. Reason: ${reason}`,
            color: 0x95A5A6
        });

        return interaction.editReply(`Mass ban complete. Success: ${success}, Failed: ${failed}.`);
    }
};
