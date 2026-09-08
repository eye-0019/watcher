const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setupgate')
        .setDescription('Posts the gate embed in the current channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x000000)
            .setDescription(
                ` **sɪʟᴇɴᴛ ᴇʏᴇ**\n\n` +
                `type **we love eyes** to gain access\n\n` +
                `📜 <#1541587463028605060> · 🎭 <#1543126010394972232>`
            )
            .setImage('https://i.imgur.com/DJWZ83c.gif')
            .setFooter({ text: 'From Watcher- i like diggin in my butt' });

        await interaction.channel.send({ embeds: [embed] });
        await interaction.reply({ content: 'gate posted!', ephemeral: true });
    }
};
