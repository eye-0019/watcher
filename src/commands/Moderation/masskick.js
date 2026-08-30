const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { logAction } = require('../../utils/logAction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('masskick')
        .setDescription('Kick multiple users by ID (space-separated)')
        .addStringOption(option =>
            option.setName('userids')
                .setDescription('User IDs separated by spaces')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for kicking')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        const ids = interaction.options.getString('userids').split(/\s+/).filter(Boolean);
        const reason = interaction.options.getString('reason') || 'No reason provided';

        await interaction.deferReply();

        let success = 0;
        let failed = 0;

        for (const id of ids) {
            try {
                const member = await interaction.guild.members.fetch(id);
                await member.kick(reason);
                success++;
            } catch {
                failed++;
            }
        }

        await logAction(interaction.guild, {
            action: 'Mass Kick',
            moderator: interaction.user,
            target: interaction.user,
            reason: `${success} kicked, ${failed} failed. Reason: ${reason}`,
            color: 0x95A5A6
        });

        return interaction.editReply(`Mass kick complete. Success: ${success}, Failed: ${failed}.`);
    }
};
