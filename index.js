const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');
const { setupBot } = require('./main');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ],
});

client.commands = new Map();

async function startBot() {
    try {
        await setupBot(client);
        const token = config.dev === 'true' ? config.devtoken : config.token;
        await client.login(token);
    } catch (error) {
        console.error('Failed to start bot:', error);
        process.exit(1);
    }
}

startBot();