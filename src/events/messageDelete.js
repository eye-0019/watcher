const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'messageDelete',
    async execute(message) {
        if (!message.guild || message.author?.bot) return;

        const logChannelId = process.env.LOG_CHANNEL_ID;
        const channel = message.guild.channels.cache.get(logChannelId);
        if (!channel) return;

        const attachment = message.attachments?.first();
        const sentTime = `<t:${Math.floor(message.createdTimestamp / 1000)}:F>`;

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'Message Deleted', iconURL: message.author?.displayAvatarURL() || null })
            .setDescription(`Message from ${message.author} deleted in ${message.channel}\nit was sent at ${sentTime}\n[Jump to message](${message.url})`)
            .addFields(
                { name: 'Message Content', value: message.content?.slice(0, 1000) || '*No content*' }
            )
            .setFooter({ text: `User ID: ${message.author?.id || 'Unknown'}` })
            .setTimestamp();

        if (attachment) embed.setImage(attachment.proxyURL || attachment.url);

        channel.send({ embeds: [embed] }).catch(() => {});
    }
};
