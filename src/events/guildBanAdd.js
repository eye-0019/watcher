const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'guildBanAdd',
    async execute(ban) {
        const logChannelId = process.env.LOG_CHANNEL_ID;
        const channel = ban.guild.channels.cache.get(logChannelId);
        if (!channel) return;

        let moderator = null;
        let reason = null;
        try {
            const auditLogs = await ban.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberBanAdd,
                limit: 5
            });
            const entry = auditLogs.entries.find(e => e.target.id === ban.user.id);
            if (entry) {
                moderator = entry.executor;
                reason = entry.reason;
            }
        } catch {}

        if (moderator && moderator.bot) return;

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'Member Banned', iconURL: ban.user.displayAvatarURL() })
            .setDescription(`${ban.user.tag} was banned`)
            .addFields(
                { name: 'Moderator', value: moderator ? `${moderator} (${moderator.id})` : 'Unknown' },
                { name: 'Reason', value: reason || 'No reason provided' }
            )
            .setFooter({ text: `User ID: ${ban.user.id}` })
            .setTimestamp();

        channel.send({ embeds: [embed] }).catch(() => {});
    }
};
