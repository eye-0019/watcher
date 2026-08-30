const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: [] }
    );
    console.log('Guild commands cleared.');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: [] }
    );
    console.log('Global commands cleared.');
  } catch (err) {
    console.error(err);
  }
})();
