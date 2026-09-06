const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");

module.exports = {
    name: "guildMemberAdd",
    async execute(member) {

        // ── Auto role ────────────────────────────────────────────────────────
        const autoRoleId = process.env.AUTO_ROLE_ID;
        if (autoRoleId) {
            try {
                await member.roles.add(autoRoleId);
            } catch (err) {
                console.error('[guildMemberAdd] Failed to assign auto role:', err);
            }
        }

        // ── Welcome message ──────────────────────────────────────────────────
        const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
        if (welcomeChannelId) {
            try {
                const welcomeChannel = await member.guild.channels.fetch(welcomeChannelId).catch(() => null);
                if (welcomeChannel?.isTextBased()) {
                    await welcomeChannel.send(`Welcome to **${member.guild.name}**, <@${member.id}>! 👋`);
                }
            } catch (err) {
                console.error('[guildMemberAdd] Failed to send welcome message:', err);
            }
        }

        // ── Log ──────────────────────────────────────────────────────────────
        await createLog(member.guild, {
            type: "member",
            action: "Member Joined",
            target: member.id,
            description: `${member.user.tag} joined the server.`,
            severity: "normal",
            logChannel: channels.members.join,
            metadata: {
                username: member.user.tag,
                userId: member.id,
                accountCreated: member.user.createdAt
            },
            color: 0x00ff99,
            fields: [
                {
                    name: "Account Created",
                    value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`
                },
                {
                    name: "Member Count",
                    value: `${member.guild.memberCount}`,
                    inline: true
                }
            ]
        });
    }
};