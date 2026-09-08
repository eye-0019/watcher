const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setupgate')
        .setDescription('Posts the gate embed in the current channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x000000)
            .setTitle('👁️ ⌕ sɪʟᴇɴᴛ ᴇʏᴇ ⌕ 👁️')
            .setDescription(
                `\`\`\`\n✦ welcome, new eye ✦\n\`\`\`\n` +
                `> *you've found your way here for a reason*\n` +
                `> *now prove you belong*\n\n` +
                `┌────────────────────────┐\n` +
                `│  to unlock the server  │\n` +
                `│  type exactly this ↓   │\n` +
                `└────────────────────────┘\n\n` +
                `### ── we love eyes ──\n\n` +
                `*and we'll let you through 🤤*`
            )
            .setImage('https://i.imgur.com/8oTBdPv.gif')
            .addFields(
                {
                    name: '⌕ rules',
                    value: `<#1541587463028605060>`,
                    inline: true
                },
                {
                    name: '⌕ roles',
                    value: `<#1543126010394972232>`,
                    inline: true
                }
            )
            .setFooter({ text: '👁️ we are always watching ✦ sɪʟᴇɴᴛ ᴇʏᴇ' });

        await interaction.channel.send({ embeds: [embed] });
        await interaction.reply({ content: 'gate posted!', ephemeral: true });
    }
};
