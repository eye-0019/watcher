const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setuproles')
        .setDescription('Posts the role menu in the roles channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {

        const channel = await interaction.guild.channels.fetch('1543126010394972232');

        // ── Gender ────────────────────────────────────────────────────────
        const genderEmbed = new EmbedBuilder()
            .setColor(0x000000)
            .setDescription(
                `⌕ **gender**\n` +
                `─────────────────\n` +
                `*pick one below*`
            );

        const genderRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('role_male')
                .setLabel('· male ·')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('role_female')
                .setLabel('· female ·')
                .setStyle(ButtonStyle.Secondary),
        );

        // ── Age ───────────────────────────────────────────────────────────
        const ageEmbed = new EmbedBuilder()
            .setColor(0x000000)
            .setDescription(
                `⌕ **age**\n` +
                `─────────────────\n` +
                `*pick one below*`
            );

        const ageRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('role_15')
                .setLabel('· 15 ·')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('role_1617')
                .setLabel('· 16-17 ·')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('role_1819')
                .setLabel('· 18-19 ·')
                .setStyle(ButtonStyle.Secondary),
        );

        // ── Color ─────────────────────────────────────────────────────────
const colorEmbed = new EmbedBuilder()
    .setColor(0x000000)
    .setDescription(
        `⌕ **color**\n` +
        `─────────────────\n` +
        `<@&1546725505347092480> · òwó ·　　　　<@&1546725957212311682> · •w• ·\n` +
        `<@&1546725958055231621> · ~w~ ·　　　　<@&1546726023905681529> · ówó ·\n` +
        `<@&1546726026594353272> · >w< ·　　　　<@&1546726028804628562> · uwu ·\n` +
        `<@&1546726284854562957> · ^w^ ·　　　　<@&1546726287127740547> · OwO ·\n` +
        `<@&1546726288646217769> · ùwú ·　　　　<@&1546726289715626036> · -w- ·`
    );

        const colorRow1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('role_owoo')
                .setLabel('· òwó ·')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('role_ww')
                .setLabel('· •w• ·')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('role_tww')
                .setLabel('· ~w~ ·')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('role_owob')
                .setLabel('· ówó ·')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('role_gwg')
                .setLabel('· >w< ·')
                .setStyle(ButtonStyle.Secondary),
        );

        const colorRow2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('role_uwu')
                .setLabel('· uwu ·')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('role_cwc')
                .setLabel('· ^w^ ·')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('role_owo')
                .setLabel('· OwO ·')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('role_uwub')
                .setLabel('· ùwú ·')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('role_dwm')
                .setLabel('· -w- ·')
                .setStyle(ButtonStyle.Secondary),
        );

        // ── Ping ─────────────────────────────────────────────────────────
        const pingEmbed = new EmbedBuilder()
            .setColor(0x000000)
            .setDescription(
                `⌕ **ping**\n` +
                `─────────────────\n` +
                `*pick any below*`
            );

        const pingRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('role_announce')
                .setLabel('· announce ·')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('role_partnership')
                .setLabel('· partnership ·')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('role_deadchat')
                .setLabel('· deadchat ·')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('role_vc')
                .setLabel('· vc ·')
                .setStyle(ButtonStyle.Secondary),
        );

        const pingRow2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('role_hallofshame')
                .setLabel('· hall of shame ·')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('role_halloffame')
                .setLabel('· hall of fame ·')
                .setStyle(ButtonStyle.Secondary),
        );

        await channel.send({ embeds: [genderEmbed], components: [genderRow] });
        await channel.send({ embeds: [ageEmbed], components: [ageRow] });
        await channel.send({ embeds: [colorEmbed], components: [colorRow1, colorRow2] });
        await channel.send({ embeds: [pingEmbed], components: [pingRow, pingRow2] });

        await interaction.reply({ content: 'role menus posted!', ephemeral: true });
    }
};
