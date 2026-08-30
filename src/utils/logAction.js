const { EmbedBuilder } = require('discord.js');

async function logAction(guild, { action, moderator, target, reason, color = 0xFFFFFF }) {
    const logChannelId = process.env.LOG_CHANNEL_ID;
    if (!logChannelId) return;

    const channel = guild.channels.cache.get(logChannelId);
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor(color)
        .setDescription(`**${action}**\n${target} was ${action.toLowerCase()} by ${moderator}\nReason: ${reason || 'No reason provided'}`);

    channel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = { logAction };
