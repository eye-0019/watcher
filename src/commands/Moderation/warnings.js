const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View a member\'s warnings.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to check')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const target = interaction.options.getUser('target');

    let rows;
    try {
      const res = await pool.query(
        'SELECT * FROM warns WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at ASC',
        [interaction.guild.id, target.id]
      );
      rows = res.rows;
    } catch (err) {
      console.error('[warnings] DB error:', err);
      return interaction.editReply({ content: 'Database error — could not fetch warnings.' });
    }

    if (rows.length === 0) {
      return interaction.editReply({ content: `${target.tag} has no warnings.` });
    }

    const embed = new EmbedBuilder()
      .setTitle(`Warnings for ${target.tag}`)
      .setColor(0x95A5A6)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setDescription(
        rows.map((w, i) =>
          `**#${w.id} (${i + 1})** ${w.reason} — by <@${w.mod_id}> on ${new Date(w.created_at).toLocaleDateString()}`
        ).join('\n')
      )
      .setFooter({ text: `Total: ${rows.length} warning(s)` });

    return interaction.editReply({ embeds: [embed] });
  },
};