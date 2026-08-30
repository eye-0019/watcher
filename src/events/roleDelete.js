const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'roleDelete',
    async execute(role) {
        const logChannelId = process.env.LOG_CHANNEL_ID;
        const logChannel = role.guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        let moderator = null;
        try {
            const auditLogs = await role.guild.fetchAuditLogs({
                type: AuditLogEvent.RoleDelete,
                limit: 5
            });
            const entry = auditLogs.entries.find(e => e.target.id === role.id);
            if (entry) moderator = entry.executor;
        } catch {}

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'Role Deleted' })
            .setDescription(`@${role.name} was deleted`)
            .addFields({ name: 'Moderator', value: moderator ? `${moderator} (${moderator.id})` : 'Unknown' })
            .setFooter({ text: `Role ID: ${role.id}` })
            .setTimestamp();

        logChannel.send({ embeds: [embed] }).catch(() => {});
    }
};
