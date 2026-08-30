const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'guildBanRemove',
    async execute(ban) {
        const logChannelId = process.env.LOG_CHANNEL_ID;
        const channel = ban.guild.channels.cache.get(logChannelId);
        if (!channel) return;

        let moderator = null;
        try {
            const auditLogs = await ban.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberBanRemove,
                limit: 5
            });
            const entry = auditLogs.entries.find(e => e.target.id === ban.user.id);
            if (entry) moderator = entry.executor;
        } catch {}

        if (moderator && moderator.bot) return;

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'Member Unbanned', iconURL: ban.user.displayAvatarURL() })
            .setDescription(`${ban.user.tag} was unbanned`)
            .addFields({ name: 'Moderator', value: moderator ? `${moderator} (${moderator.id})` : 'Unknown' })
            .setFooter({ text: `User ID: ${ban.user.id}` })
            .setTimestamp();

        channel.send({ embeds: [embed] }).catch(() => {});
    }
};
