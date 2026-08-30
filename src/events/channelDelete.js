const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'channelDelete',
    async execute(channel) {
        if (!channel.guild) return;

        const logChannelId = process.env.LOG_CHANNEL_ID;
        const logChannel = channel.guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        let moderator = null;
        try {
            const auditLogs = await channel.guild.fetchAuditLogs({
                type: AuditLogEvent.ChannelDelete,
                limit: 5
            });
            const entry = auditLogs.entries.find(e => e.target.id === channel.id);
            if (entry) moderator = entry.executor;
        } catch {}

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'Channel Deleted' })
            .setDescription(`#${channel.name} was deleted`)
            .addFields({ name: 'Moderator', value: moderator ? `${moderator} (${moderator.id})` : 'Unknown' })
            .setFooter({ text: `Channel ID: ${channel.id}` })
            .setTimestamp();

        logChannel.send({ embeds: [embed] }).catch(() => {});
    }
};
