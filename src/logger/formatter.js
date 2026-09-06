const { EmbedBuilder } = require("discord.js");

const TYPE_ICONS = {
    moderation: '🔨',
    member:     '👤',
    message:    '💬',
    voice:      '🔊',
    channel:    '📁',
    role:       '🎭',
    invite:     '🔗',
    unknown:    '📋',
};

function createLogEmbed({
    action,
    description,
    type,
    severity = "normal",
    fields = [],
    thumbnailUrl = null,
}) {
    const icon = TYPE_ICONS[type] ?? TYPE_ICONS.unknown;

    const embed = new EmbedBuilder()
        .setTitle(`${icon} ${action}`)
        .setColor(0x2B2D31)
        .setTimestamp()
        .setFooter({ text: `Severity: ${severity.toUpperCase()}` });

    if (description) embed.setDescription(description);
    if (thumbnailUrl) embed.setThumbnail(thumbnailUrl);

    if (fields.length > 0) {
        embed.addFields(fields.map(f => ({
            name:   f.name,
            value:  String(f.value).slice(0, 1024) || '\u200b',
            inline: f.inline ?? false,
        })));
    }

    return embed;
}

module.exports = { createLogEmbed };
