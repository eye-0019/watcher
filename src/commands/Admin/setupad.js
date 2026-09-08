const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setupad')
        .setDescription('Posts the server ad embed in the current channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {

        const memberCount = interaction.guild.memberCount;

        const embed = new EmbedBuilder()
            .setColor(0x000000)
            .setTitle(' sɪʟᴇɴᴛ ᴇʏᴇ')
            .setDescription(
                `*Our bot likes diging in his butt.*\n` +
                `─────────────────────────────\n\n` +
                `⌕ semi-toxic. come as you are.\n` +
                `⌕ show your face. get rated. no filter.\n` +
                `⌕ hangout, make friends, cause problems.\n` +
                `⌕ powered by our own custom AI bot.\n\n` +
                `─────────────────────────────\n` +
                `> **${memberCount}** members and watching\n\n` +
                `[join silent eye](https://discord.gg/U8hKdArk3a)`
            )
            .setImage('https://i.imgur.com/DJWZ83c.gif')
            .setFooter({ text: 'sɪʟᴇɴᴛ ᴇʏᴇ · we are always watching' });

        await interaction.channel.send({ embeds: [embed] });
        await interaction.reply({ content: 'ad posted!', ephemeral: true });
    }
};
