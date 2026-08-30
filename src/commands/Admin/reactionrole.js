const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addReactionRole } = require('../../utils/reactionRolesStore');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactionrole')
        .setDescription('Set up a self-assign reaction role on a message')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('The ID of the message people will react to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('The emoji to react with')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to assign')
                .setRequired(true)),

    async execute(interaction) {
        const messageId = interaction.options.getString('message_id');
        const emoji = interaction.options.getString('emoji');
        const role = interaction.options.getRole('role');

        const channel = interaction.channel;
        try {
            const message = await channel.messages.fetch(messageId);
            await message.react(emoji);
        } catch (err) {
            return interaction.reply({ content: 'Could not find that message in this channel, or the emoji is invalid.', ephemeral: true });
        }

        await addReactionRole(messageId, emoji, role.id);
        return interaction.reply(`Reacting with ${emoji} on that message now assigns the **${role.name}** role.`);
    }
};
