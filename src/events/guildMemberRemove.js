const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        const logChannelId = process.env.LOG_CHANNEL_ID;
        const channel = member.guild.channels.cache.get(logChannelId);
        if (!channel) return;

        let moderator = null;
        let reason = null;
        try {
            const auditLogs = await member.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberKick,
                limit: 5
            });
            const entry = auditLogs.entries.find(
                e => e.target.id === member.id && Date.now() - e.createdTimestamp < 5000
            );
            if (entry) {
                moderator = entry.executor;
                reason = entry.reason;
            }
        } catch {}

        if (moderator && moderator.bot) return;

        const embed = new EmbedBuilder()
            .setAuthor({ name: moderator ? 'Member Kicked' : 'Member Left', iconURL: member.user.displayAvatarURL() });

        if (moderator) {
            embed.setDescription(`${member.user.tag} was kicked`)
                .addFields(
                    { name: 'Moderator', value: `${moderator} (${moderator.id})` },
                    { name: 'Reason', value: reason || 'No reason provided' }
                );
        } else {
            embed.setDescription(`${member.user} left the server`);
        }

        embed.setFooter({ text: `User ID: ${member.id}` }).setTimestamp();

        channel.send({ embeds: [embed] }).catch(() => {});
    }
};
