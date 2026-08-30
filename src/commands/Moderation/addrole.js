const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addrole')
        .setDescription('Add a role to a member')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to give the role to')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to add')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for adding this role')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const role = interaction.options.getRole('role');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) {
            return interaction.reply({ content: 'Could not find that member.', ephemeral: true });
        }
        if (target.roles.cache.has(role.id)) {
            return interaction.reply({ content: `${target.user.tag} already has that role.`, ephemeral: true });
        }

        await target.roles.add(role, reason);
        return interaction.reply(`Added ${role} to ${target.user.tag}. Reason: ${reason}`);
    }
};
