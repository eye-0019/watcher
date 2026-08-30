const { EmbedBuilder } = require('discord.js');
const { cacheGuildInvites, getCachedInvites } = require('../utils/inviteCache');
const { recordJoin, isRaidActive, isAccountTooNew } = require('../utils/raidGuard');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const logChannelId = process.env.LOG_CHANNEL_ID;
        const logChannel = logChannelId ? member.guild.channels.cache.get(logChannelId) : null;

        // Raid protection
        const raidJustDetected = recordJoin(member.guild.id);
        if (raidJustDetected && logChannel) {
            logChannel.send('🚨 **Possible raid detected** — a burst of joins just came in. Auto-kicking brand new accounts for the next couple minutes.').catch(() => {});
        }

        if (isRaidActive(member.guild.id) && isAccountTooNew(member.user)) {
            member.kick('Auto anti-raid: brand new account during a join burst').catch(() => {});
            if (logChannel) {
                logChannel.send(`🚨 Auto-kicked ${member.user.tag} (account too new) during an active raid window.`).catch(() => {});
            }
            return;
        }

        const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
        const welcomeChannel = welcomeChannelId ? member.guild.channels.cache.get(welcomeChannelId) : null;
        if (welcomeChannel) {
            welcomeChannel.send(`Welcome ${member} to the server! 🎉`).catch(() => {});
        }

        const memberRoleId = process.env.MEMBER_ROLE_ID;
        if (memberRoleId) {
            member.roles.add(memberRoleId).catch(() => {});
        }

        if (!logChannel) return;

        const oldInvites = getCachedInvites(member.guild.id);
        let usedInvite = null;

        try {
            const newInvites = await member.guild.invites.fetch();
            usedInvite = newInvites.find(invite => {
                const oldUses = oldInvites.get(invite.code) || 0;
                return invite.uses > oldUses;
            });
        } catch {}

        await cacheGuildInvites(member.guild);

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'Member Joined', iconURL: member.user.displayAvatarURL() })
            .setDescription(`${member.user} joined the server`)
            .addFields({
                name: 'Invite Used',
                value: usedInvite ? `${usedInvite.code} (by ${usedInvite.inviter?.tag || 'Unknown'})` : 'Unknown'
            })
            .setFooter({ text: `User ID: ${member.id}` })
            .setTimestamp();

        logChannel.send({ embeds: [embed] }).catch(() => {});
    }
};
