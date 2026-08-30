const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removerole')
        .setDescription('Remove a role from a member')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to remove the role from')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to remove')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for removing this role')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const role = interaction.options.getRole('role');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) {
            return interaction.reply({ content: 'Could not find that member.', ephemeral: true });
        }
        if (!target.roles.cache.has(role.id)) {
            return interaction.reply({ content: `${target.user.tag} doesn't have that role.`, ephemeral: true });
        }

        await target.roles.remove(role, reason);
        return interaction.reply(`Removed ${role} from ${target.user.tag}. Reason: ${reason}`);
    }
};
