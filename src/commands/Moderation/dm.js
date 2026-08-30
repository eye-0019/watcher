const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { setTicket, getChannelForUser } = require('../../utils/dmTicketsStore');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dm')
        .setDescription('DM a user, their replies show up in a private channel here')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to DM')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const message = interaction.options.getString('message');

        try {
            await target.send(message);
        } catch (err) {
            return interaction.reply({ content: `Could not DM ${target.tag}. They may have DMs closed.`, ephemeral: true });
        }

        let channelId = await getChannelForUser(target.id);
        let channel = channelId ? interaction.guild.channels.cache.get(channelId) : null;

        if (!channel) {
            const overwrites = [
                { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] }
            ];
            const staffRoleId = process.env.STAFF_ROLE_ID;
            if (staffRoleId) {
                overwrites.push({ id: staffRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] });
            }

            channel = await interaction.guild.channels.create({
                name: `dm-${target.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 90) || `dm-${target.id}`,
                type: ChannelType.GuildText,
                parent: process.env.MODMAIL_CATEGORY_ID || undefined,
                permissionOverwrites: overwrites
            }).catch(() => null);

            if (channel) await setTicket(target.id, channel.id);
        }

        return interaction.reply(`DM sent to ${target.tag}.${channel ? ` Their replies will show up in ${channel}.` : ''}`);
    }
};
