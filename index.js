const fs = require('fs');
const path = require('path');
const http = require('http');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');

require('dotenv').config();

// ============================================================
// Render web server
// ============================================================

const PORT = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Watcher bot is running');
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Web server listening on 0.0.0.0:${PORT}`);
});

// ============================================================
// Discord client
// ============================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.DirectMessages
    ],

    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction
    ]
});

// ============================================================
// Commands
// ============================================================

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);

    const commandFiles = fs
        .readdirSync(folderPath)
        .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(
                `Warning: command at ${filePath} is missing "data" or "execute".`
            );
        }
    }
}

// ============================================================
// Events
// ============================================================

const eventsPath = path.join(__dirname, 'src', 'events');

const eventFiles = fs
    .readdirSync(eventsPath)
    .filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// ============================================================
// Login
// ============================================================

client.login(process.env.DISCORD_TOKEN);
