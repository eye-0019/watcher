const { EmbedBuilder } = require('discord.js');
const { getDmContext } = require('../utils/dmContext');
const { addMessageXp } = require('../utils/xpStore');
const { getResponse } = require('../utils/customCommandsStore');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;

        if (message.guild) {
            // Leveling/XP
            const result = addMessageXp(message.author.id);
            if (result && result.leveledUp) {
                message.channel.send(`🎉 ${message.author} leveled up to **level ${result.newLevel}**!`).catch(() => {});
            }

            // Custom keyword-triggered commands (first word of the message)
            const firstWord = message.content.trim().split(/\s+/)[0];
            if (firstWord) {
                const response = getResponse(firstWord);
                if (response) {
                    message.channel.send(response).catch(() => {});
                }
            }

            return;
        }

        const guildId = getDmContext(message.author.id);
        if (!guildId) return;

        const guild = client.guilds.cache.get(guildId);
        if (!guild) return;

        const logChannel = guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor(0xFFFFFF)
            .setDescription(`DM reply from ${message.author}`)
            .addFields(
                { name: 'Message', value: message.content?.slice(0, 1000) || '*No content*' }
            );

        logChannel.send({ embeds: [embed] }).catch(() => {});
    }
};
