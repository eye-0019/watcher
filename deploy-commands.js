const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [];

const commandsPath = path.join(__dirname, 'src', 'commands');

const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {

    const folderPath = path.join(commandsPath, folder);

    // Only load folders
    if (!fs.statSync(folderPath).isDirectory()) {
        continue;
    }


    const commandFiles = fs
        .readdirSync(folderPath)
        .filter(file => file.endsWith('.js'));


    for (const file of commandFiles) {

        const commandPath = path.join(folderPath, file);

        try {

            const command = require(commandPath);


            if (!command.data) {
                console.log(`Skipping invalid command: ${commandPath}`);
                continue;
            }


            console.log(`Loaded: ${command.data.name}`);

            commands.push(command.data.toJSON());


        } catch (error) {

            console.error(`Failed loading: ${commandPath}`);
            console.error(error);

        }
    }
}


const rest = new REST().setToken(process.env.DISCORD_TOKEN);


(async () => {

    try {

        console.log(`Deploying ${commands.length} slash command(s)...`);


        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            {
                body: commands
            }
        );


        console.log('Slash commands deployed successfully.');


    } catch (error) {

        console.error(error);

    }

})();