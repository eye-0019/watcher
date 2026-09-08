
const { createLog } = require("../logger/logger");
const channels = require("../logger/channels");
const { EmbedBuilder } = require("discord.js");

const welcomeMessages = [
    `welcome <@{id}> 👀`,
    `<@{id}> just joined, hey!`,
    `we got a new one, welcome <@{id}> 🗣️`,
    `<@{id}> pulled up, welcome in`,
    `hey <@{id}>, glad you're here ❤️`,
    `<@{id}> just joined the server`,
    `welcome to sɪʟᴇɴᴛ ᴇʏᴇ <@{id}> 😼`,
    `<@{id}> is here, welcome in`,
    `no way <@{id}> actually joined 😉`,
    `welcome <@{id}>, make yourself at home`,
    `<@{id}> just dropped, welcome in 😌`,
    `hey <@{id}>, welcome to the server`,
    `<@{id}> joined, glad to have you 👅`,
    `welcome in <@{id}>`,
    `<@{id}> is now a member, welcome! 🤤`,
    `glad you made it <@{id}>`,
    `<@{id}> just joined 😼`,
    `the server just got better, hey <@{id}>`,
    `welcome <@{id}>, enjoy your stay ❤️`,
    `<@{id}> joined sɪʟᴇɴᴛ ᴇʏᴇ`,
];

module.exports = {
    name: "guildMemberAdd",
    async execute(member) {

        // ── Auto role ─────────────────────────────────────────────────────
        const autoRoleId = process.env.AUTO_ROLE_ID;
        if (autoRoleId) {
            try {
                await member.roles.add(autoRoleId);
            } catch (err) {
                console.error('[guildMemberAdd] Failed to assign auto role:', err);
            }
        }

        // ── Welcome embed ─────────────────────────────────────────────────
        const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
        if (welcomeChannelId) {
            try {
                const welcomeChannel = await member.guild.channels.fetch(welcomeChannelId).catch(() => null);
                if (welcomeChannel?.isTextBased()) {
                    const random = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
                    const message = random.replace(/{id}/g, member.id);

                    const embed = new EmbedBuilder()
                        .setColor(0x000000)
                        .setAuthor({
                            name: member.user.username,
                            iconURL: member.user.displayAvatarURL({ dynamic: true })
                        })
                        .setDescription(message)
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                        .addFields(
                            {
                                name: 'get started',
                                value: `📜 read <#1541587463028605060>\n🎭 get your <#1543126010394972232>`,
                            },
                            {
                                name: 'member count',
                                value: `\`${member.guild.memberCount}\``,
                                inline: true
                            },
                            {
                                name: 'account age',
                                value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
                                inline: true
                            }
                        )
                        .setFooter({ text: 'sɪʟᴇɴᴛ ᴇʏᴇ' })
                        .setTimestamp();

                    await welcomeChannel.send({ embeds: [embed] });

                    const ping = await welcomeChannel.send(`<@${member.id}>`);
                    setTimeout(() => ping.delete().catch(() => {}), 3000);
                }
            } catch (err) {
                console.error('[guildMemberAdd] Failed to send welcome message:', err);
            }
        }

        // ── Log ───────────────────────────────────────────────────────────
        await createLog(member.guild, {
            type: "member",
            action: "Member Joined",
            target: member.id,
            description: `${member.user.tag} joined the server.`,
            severity: "normal",
            logChannel: channels.members.join,
            thumbnailUrl: member.user.displayAvatarURL({ dynamic: true }),
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
