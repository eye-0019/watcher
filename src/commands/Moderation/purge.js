const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { logAction } = require('../../utils/logAction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Delete a number of messages from this channel')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('How many messages to delete')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        let amount = interaction.options.getInteger('amount');
        if (amount < 1) {
            return interaction.reply({ content: 'Amount must be at least 1.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        let deletedTotal = 0;
        while (amount > 0) {
            const chunk = Math.min(amount, 100);
            const deleted = await interaction.channel.bulkDelete(chunk, true).catch(() => null);
            if (!deleted || deleted.size === 0) break;
            deletedTotal += deleted.size;
            amount -= deleted.size;
            if (deleted.size < chunk) break;
        }

        await logAction(interaction.guild, {
            action: 'Messages Purged',
            moderator: interaction.user,
            target: interaction.user,
            reason: `${deletedTotal} messages deleted in ${interaction.channel}`,
            color: 0x95A5A6
        });

        return interaction.editReply(`Deleted ${deletedTotal} message(s).`);
    }
};
