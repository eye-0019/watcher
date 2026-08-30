const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { addCommand, removeCommand, listCommands } = require('../../utils/customCommandsStore');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('customcommand')
        .setDescription('Manage keyword-triggered custom responses')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Add or update a custom command')
                .addStringOption(option =>
                    option.setName('keyword')
                        .setDescription('The word that triggers the response')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('response')
                        .setDescription('What the bot replies with')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Remove a custom command')
                .addStringOption(option =>
                    option.setName('keyword')
                        .setDescription('The keyword to remove')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('List all custom commands')),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'add') {
            const keyword = interaction.options.getString('keyword');
            const response = interaction.options.getString('response');
            addCommand(keyword, response);
            return interaction.reply(`Added custom command: \`${keyword}\` → ${response}`);
        }

        if (sub === 'remove') {
            const keyword = interaction.options.getString('keyword');
            const removed = removeCommand(keyword);
            return interaction.reply(removed ? `Removed custom command \`${keyword}\`.` : `No custom command found for \`${keyword}\`.`);
        }

        if (sub === 'list') {
            const commands = listCommands();
            const entries = Object.entries(commands);
            if (entries.length === 0) {
                return interaction.reply('No custom commands set up yet.');
            }
            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('Custom Commands')
                .setDescription(entries.map(([k, v]) => `**${k}** → ${v}`).join('\n'));
            return interaction.reply({ embeds: [embed] });
        }
    }
};
