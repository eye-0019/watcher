const { EmbedBuilder } = require("discord.js");

const SEVERITY_COLORS = {
    normal:   0x5865F2,
    low:      0x57F287,
    medium:   0xFEE75C,
    high:     0xE67E22,
    critical: 0xED4245,
};

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
    color,
    thumbnailUrl = null,
}) {
    const icon       = TYPE_ICONS[type] ?? TYPE_ICONS.unknown;
    const embedColor = color ?? SEVERITY_COLORS[severity] ?? 0x5865F2;

    const embed = new EmbedBuilder()
        .setTitle(`${icon} ${action}`)
        .setColor(embedColor)
        .setTimestamp()
        .setFooter({ text: `Severity: ${severity.toUpperCase()}` });

    if (description) {
        embed.setDescription(description);
    }

    if (thumbnailUrl) {
        embed.setThumbnail(thumbnailUrl);
    }

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