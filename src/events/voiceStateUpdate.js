const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        const member = newState.member || oldState.member;
        if (!member || member.user.bot) return;

        const logChannelId = process.env.LOG_CHANNEL_ID;
        const channel = (newState.guild || oldState.guild).channels.cache.get(logChannelId);
        if (!channel) return;

        let description = null;
        let checkMod = false;

        if (!oldState.channelId && newState.channelId) {
            description = `${member} joined ${newState.channel}`;
        } else if (oldState.channelId && !newState.channelId) {
            description = `${member} left ${oldState.channel}`;
        } else if (oldState.channelId !== newState.channelId) {
            description = `${member} moved from ${oldState.channel} to ${newState.channel}`;
        } else if (oldState.serverMute !== newState.serverMute) {
            description = newState.serverMute ? `${member} was server muted` : `${member} was server unmuted`;
            checkMod = true;
        } else if (oldState.serverDeaf !== newState.serverDeaf) {
            description = newState.serverDeaf ? `${member} was server deafened` : `${member} was server undeafened`;
            checkMod = true;
        } else {
            return;
        }

        let moderator = null;
        if (checkMod) {
            try {
                const auditLogs = await member.guild.fetchAuditLogs({
                    type: AuditLogEvent.MemberUpdate,
                    limit: 5
                });
                const entry = auditLogs.entries.find(e => e.target.id === member.id);
                if (entry) moderator = entry.executor;
            } catch {}
        }

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'Voice State Updated', iconURL: member.user.displayAvatarURL() })
            .setDescription(description)
            .setFooter({ text: `User ID: ${member.id}` })
            .setTimestamp();

        if (moderator) {
            embed.addFields({ name: 'Moderator', value: `${moderator} (${moderator.id})` });
        }

        channel.send({ embeds: [embed] }).catch(() => {});
    }
};
