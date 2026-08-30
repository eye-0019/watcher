const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        if (newMember.user.bot) return;

        const logChannelId = process.env.LOG_CHANNEL_ID;
        const channel = newMember.guild.channels.cache.get(logChannelId);
        if (!channel) return;

        const oldRoles = oldMember.roles.cache;
        const newRoles = newMember.roles.cache;

        const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
        const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));

        if (addedRoles.size > 0 || removedRoles.size > 0) {
            let moderator = null;
            try {
                const auditLogs = await newMember.guild.fetchAuditLogs({
                    type: AuditLogEvent.MemberRoleUpdate,
                    limit: 5
                });
                const entry = auditLogs.entries.find(e => e.target.id === newMember.id);
                if (entry) moderator = entry.executor;
            } catch {}

            const roleText = addedRoles.size > 0
                ? `was granted ${addedRoles.map(r => r).join(', ')}`
                : `was removed from ${removedRoles.map(r => r).join(', ')}`;

            const embed = new EmbedBuilder()
                .setAuthor({ name: 'Member Roles Updated', iconURL: newMember.user.displayAvatarURL() })
                .setDescription(`${newMember} (${newMember.id}) ${roleText}`)
                .addFields({ name: 'Moderator', value: moderator ? `${moderator} (${moderator.id})` : 'Unknown' })
                .setFooter({ text: `User ID: ${newMember.id}` })
                .setTimestamp();

            channel.send({ embeds: [embed] }).catch(() => {});
        }

        if (oldMember.nickname !== newMember.nickname) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: 'Nickname Changed', iconURL: newMember.user.displayAvatarURL() })
                .addFields(
                    { name: 'Before', value: oldMember.nickname || '*None*' },
                    { name: 'After', value: newMember.nickname || '*None*' }
                )
                .setFooter({ text: `User ID: ${newMember.id}` })
                .setTimestamp();

            channel.send({ embeds: [embed] }).catch(() => {});
        }
    }
};
