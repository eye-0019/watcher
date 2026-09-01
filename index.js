const fs = require('fs');
const path = require('path');
const http = require('http');
const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection
} = require('discord.js');

require('dotenv').config();

// ============================================================
// Environment validation
// ============================================================

if (!process.env.DISCORD_TOKEN) {
    console.error('❌ DISCORD_TOKEN is missing from your environment variables.');
    process.exit(1);
}

// ============================================================
// Render web server
// ============================================================

const PORT = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Watcher bot is running');
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Web server listening on 0.0.0.0:${PORT}`);
});

server.on('error', error => {
    console.error('❌ Web server error:', error);
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
// Discord error handling
// ============================================================

client.on('error', error => {
    console.error('❌ Discord client error:', error);
});

client.on('warn', warning => {
    console.warn('⚠️ Discord warning:', warning);
});

client.on('shardError', error => {
    console.error('❌ Discord shard error:', error);
});

process.on('unhandledRejection', error => {
    console.error('❌ Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('❌ Uncaught exception:', error);
});

// ============================================================
// Commands
// ============================================================

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'src', 'commands');

if (!fs.existsSync(commandsPath)) {
    console.error(`❌ Commands directory not found: ${commandsPath}`);
    process.exit(1);
}

const commandFolders = fs
    .readdirSync(commandsPath, { withFileTypes: true })
    .filter(entry => entry.isDirectory());

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder.name);

    const commandFiles = fs
        .readdirSync(folderPath)
        .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);

        try {
            const command = require(filePath);

            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                console.log(`✅ Loaded command: ${command.data.name}`);
            } else {
                console.warn(
                    `⚠️ Command at ${filePath} is missing "data" or "execute".`
                );
            }
        } catch (error) {
            console.error(`❌ Failed to load command ${filePath}:`, error);
        }
    }
}

// ============================================================
// Events
// ============================================================

const eventsPath = path.join(__dirname, 'src', 'events');

if (!fs.existsSync(eventsPath)) {
    console.error(`❌ Events directory not found: ${eventsPath}`);
    process.exit(1);
}

const eventFiles = fs
    .readdirSync(eventsPath)
    .filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);

    try {
        const event = require(filePath);

        if (!event.name || !event.execute) {
            console.warn(
                `⚠️ Event at ${filePath} is missing "name" or "execute".`
            );
            continue;
        }

        if (event.once) {
            client.once(
                event.name,
                (...args) => event.execute(...args, client)
            );
        } else {
            client.on(
                event.name,
                (...args) => event.execute(...args, client)
            );
        }

        console.log(`✅ Loaded event: ${event.name}`);
    } catch (error) {
        console.error(`❌ Failed to load event ${filePath}:`, error);
    }
}

// ============================================================
// Login
// ============================================================

client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('❌ Failed to log into Discord:', error);
    process.exit(1);
});

// ============================================================
// Graceful shutdown
// ============================================================

async function shutdown(signal) {
    console.log(`\n🛑 Received ${signal}. Shutting down Watcher...`);

    try {
        client.destroy();
        server.close(() => {
            console.log('✅ Web server closed.');
            process.exit(0);
        });

        // Fallback in case server.close() never completes
        setTimeout(() => {
            process.exit(0);
        }, 5000).unref();
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
