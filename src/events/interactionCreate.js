
const { Events, InteractionType } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {

    // ── Slash commands ───────────────────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.warn(`[interactionCreate] Unknown command: ${interaction.commandName}`);
        // Safe reply — only if the interaction hasn't been touched yet
        return safeReply(interaction, {
          content: 'Unknown command.',
          ephemeral: true,
        });
      }

      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(
          `[interactionCreate] Error in /${interaction.commandName}:`,
          err
        );
        // The command may have already deferred or replied — use safeReply
        await safeReply(interaction, {
          content: 'There was an error while executing this command.',
          ephemeral: true,
        });
      }
      return;
    }

    // ── Autocomplete ─────────────────────────────────────────────────────────
    if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command?.autocomplete) return;
      try {
        await command.autocomplete(interaction);
      } catch (err) {
        console.error(`[interactionCreate] Autocomplete error in /${interaction.commandName}:`, err);
      }
      return;
    }

    // ── Button / Select Menu / Modal ─────────────────────────────────────────
    if (interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit()) {
      // Route to component handlers if you add them later
      // const handler = interaction.client.components?.get(interaction.customId);
      // if (handler) { ... }
      return;
    }
  },
};

/**
 * safeReply — replies or edits without throwing a 40060.
 *
 * Priority:
 *   1. If already deferred  → editReply
 *   2. If already replied   → followUp (ephemeral)
 *   3. Otherwise            → reply
 */
async function safeReply(interaction, options) {
  try {
    if (interaction.deferred) {
      await interaction.editReply(options);
    } else if (interaction.replied) {
      await interaction.followUp({ ...options, ephemeral: true });
    } else {
      await interaction.reply({ ...options, ephemeral: true });
    }
  } catch (err) {
    // Last resort — log but never crash the process
    console.error('[safeReply] Could not send error message to user:', err.message);
  }
}
