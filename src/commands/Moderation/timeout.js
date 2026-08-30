const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { logAction } = require('../../utils/logAction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout (mute) a member')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('minutes')
                .setDescription('How many minutes to timeout for')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for timeout')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const minutes = interaction.options.getInteger('minutes');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) {
            return interaction.reply({ content: 'Could not find that member.', ephemeral: true });
        }
        if (!target.moderatable) {
            return interaction.reply({ content: 'I cannot timeout that member.', ephemeral: true });
        }

        await target.timeout(minutes * 60 * 1000, reason);
        await logAction(interaction.guild, {
            action: 'Member Timed Out',
            moderator: interaction.user,
            target: target.user,
            reason: `${reason} (${minutes} min)`,
            color: 0x95A5A6
        });

        const mainChannelId = process.env.MAIN_CHANNEL_ID;
        const mainChannel = mainChannelId ? interaction.guild.channels.cache.get(mainChannelId) : null;
        if (mainChannel) {
            mainChannel.send(`${target.user} why did you spam can you stop? You're just giving me more work you bum`).catch(() => {});
        }

        return interaction.reply(`Timed out ${target.user.tag} for ${minutes} minute(s). Reason: ${reason}`);
    }
};
