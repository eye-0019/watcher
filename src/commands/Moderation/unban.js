const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { logAction } = require('../../utils/logAction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user by ID')
        .addStringOption(option =>
            option.setName('userid')
                .setDescription('The user ID to unban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for unbanning')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const rawId = interaction.options.getString('userid');
        const userId = rawId ? rawId.trim().replace(/\D/g, '') : null;
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!userId) {
            return interaction.reply({ content: 'That doesn\'t look like a valid user ID.', ephemeral: true });
        }

        try {
            const user = await interaction.client.users.fetch(userId);
            await interaction.guild.bans.remove(userId, reason);

            await logAction(interaction.guild, {
                action: 'Member Unbanned',
                moderator: interaction.user,
                target: user,
                reason,
                color: 0x95A5A6
            });

            return interaction.reply(`Unbanned ${user.tag}. Reason: ${reason}`);
        } catch (err) {
            console.error('Unban error:', JSON.stringify(err.rawError, null, 2));
            return interaction.reply({ content: 'Could not unban that user. Check the ID and make sure they are banned.', ephemeral: true });
        }
    }
};
