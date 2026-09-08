const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setuprules')
        .setDescription('Posts the rules embed in the rules channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {

        const channel = await interaction.guild.channels.fetch('1541587463028605060');

        const embed = new EmbedBuilder()
            .setColor(0x000000)
            .setTitle('👁️ sɪʟᴇɴᴛ ᴇʏᴇ · rules')
            .setDescription(
                `*follow these or get the boot 🥾*\n` +
                `─────────────────────────────\n\n` +
                `⌕ **don't be a loser**\n` +
                `> jokes and arguing are fine. harassing, bullying, or targeting someone isn't.\n\n` +
                `⌕ **respect boundaries**\n` +
                `> if someone tells you to stop, stop. no means no, you horny freaks.\n\n` +
                `⌕ **keep it legal**\n` +
                `> no illegal content or encouraging illegal activity. if you're 18 please don't talk to a 15 year old weird.\n\n` +
                `⌕ **for nsfw**\n` +
                `> nsfw is okay just don't be a loser and ask people for stuff more than once. trust me, people will get horny with u in dms if they wanted to.\n\n` +
                `⌕ **no doxxing**\n` +
                `> don't share anyone's private information without their permission.\n\n` +
                `⌕ **use common sense**\n` +
                `> don't spam, advertise without permission, or intentionally ruin the server for other people.\n\n` +
                `⌕ **staff decisions are final**\n` +
                `> if a mod asks you to stop, listen. if you have an issue, talk to them nicely.\n\n` +
                `⌕ **only slurs you can claim**\n` +
                `> you don't want accusations now do you?\n\n` +
                `─────────────────────────────\n` +
                `*warnings → timeouts → ban. simple.*`
            )
            .setFooter({ text: 'sɪʟᴇɴᴛ ᴇʏᴇ · we are always watching' });

        await channel.send({ embeds: [embed] });
        await interaction.reply({ content: 'rules posted!', ephemeral: true });
    }
};
