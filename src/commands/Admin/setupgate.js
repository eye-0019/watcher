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
                `👁️ **sɪʟᴇɴᴛ ᴇʏᴇ**\n\n` +
                `type **we love eyes** to gain access`
            )
            .setImage('https://i.imgur.com/8oTBdPv.gif')
            .setFooter({ text: 'we are always watching' });

        await interaction.channel.send({ embeds: [embed] });
        await interaction.reply({ content: 'gate posted!', ephemeral: true });
    }
};
