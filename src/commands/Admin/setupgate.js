const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setupgate')
        .setDescription('Posts the gate embed in the current channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x000000)
            .setTitle('sɪʟᴇɴᴛ ᴇʏᴇ')
            .setDescription(
                `> welcome to the server 👁️\n\n` +
                `to gain access type\n` +
                `## we love eyes\n` +
                `in this channel and we'll let you in 🤤`
            )
            .setImage('https://i.imgur.com/8oTBdPv.gif')
            .setFooter({ text: 'sɪʟᴇɴᴛ ᴇʏᴇ' });

        await interaction.channel.send({ embeds: [embed] });
        await interaction.reply({ content: 'gate posted!', ephemeral: true });
    }
};
