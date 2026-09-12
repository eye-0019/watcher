const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const { getNotes } = require('../../utils/aiMemoryStore');
const { pool } = require('../../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('memory-remove')
        .setDescription('Remove a memory note from a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to remove memory from')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('text')
                .setDescription('Text inside the memory to remove')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),

    async execute(interaction) {

        const user = interaction.options.getUser('user');
        const removeText = interaction.options.getString('text');

        const memory = await getNotes(user.id);

        if (!memory.notes) {
            return interaction.reply({
                content: '❌ This user has no saved memories.',
                ephemeral: true
            });
        }

        const oldNotes = memory.notes;

        const newNotes = oldNotes
            .split('\n')
            .filter(note =>
                !note.toLowerCase().includes(
                    removeText.toLowerCase()
                )
            )
            .join('\n');

        if (oldNotes === newNotes) {
            return interaction.reply({
                content: '❌ Could not find that memory.',
                ephemeral: true
            });
        }

        await pool.query(
            `
            UPDATE ai_user_notes
            SET notes = $1,
                updated_at = now()
            WHERE user_id = $2
            `,
            [
                newNotes || null,
                user.id
            ]
        );

        await interaction.reply({
            content:
                `🧠 Removed memory from ${user.username}\n\n` +
                `Removed text: ${removeText}`,
            ephemeral: true
        });
    }
};
