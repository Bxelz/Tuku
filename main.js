const { startAnimeWatcher, Collection, ActivityType, EmbedBuilder, fs, loadSlashCommands, loadTextCommands, logMessage, petty, banFilePath, commandConfigPath, allowCmdPath, config } = require('./const');

const getBans = () => {
    try {
        const data = fs.readFileSync(banFilePath, 'utf8');
        return JSON.parse(data).bans || [];
    } catch (error) {
        console.error('Error reading ban data:', error);
        return [];
    }
};

const isUserBanned = (userId) => getBans().find(ban => ban.id === userId);

const createBanEmbed = (reason) => new EmbedBuilder()
    .setColor('Red')
    .setTitle('<:Error:1345237013632385106> Unable To Execute Command')
    .setDescription(
        `Your profile has been blocked from using ${config.name}'s services.\n` +
        `\`\`\`Reason: ${reason}\`\`\`\n` +
        '-# Did we make a mistake? Submit an [appeal](https://discord.gg/w5TT6KAKbF) within our support server.'
    );

const updateCommandUsage = (commandName) => {
    try {
        const commandData = fs.existsSync(commandConfigPath)
            ? JSON.parse(fs.readFileSync(commandConfigPath, 'utf8'))
            : {};

        commandData[commandName] = (commandData[commandName] || 0) + 1;
        fs.writeFileSync(commandConfigPath, JSON.stringify(commandData, null, 4));
    } catch (error) {
        console.error('Error updating command usage:', error);
    }
};

const logError = (type, source, error) => {
    let lineNumber = 1;
    if (fs.existsSync(ERROR_FILE_PATH)) {
        const fileContent = fs.readFileSync(ERROR_FILE_PATH, 'utf8');
        lineNumber = fileContent.split('\n').filter(line => line.trim() !== '').length + 1;
    }
    const errorCode = `${type}${source}${lineNumber}`;
    const rawErrorMessage = error.stack || error.toString();
    const singleLineErrorMessage = rawErrorMessage.replace(/\n/g, ' | ');
    
    const errorMessage = `[${new Date().toISOString()}] ${errorCode}: ${singleLineErrorMessage}\n`;
    fs.appendFileSync(ERROR_FILE_PATH, errorMessage);
    return errorCode;
};

const createErrorEmbed = (errorCode, errorType) => new EmbedBuilder()
    .setColor('Red')
    .setTitle('<:Error:1345237013632385106> An Internal Command Error Occurred')
    .setDescription(
        `This is a ${errorType} error, please report this to <@565852514033860629> in our [Discord Server](https://discord.gg/RkuUmbByR9), with this error code: \`${errorCode}\``
    );

const loadAllowCmd = () => {
    try {
        const data = fs.readFileSync(allowCmdPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading allow command data:', error);
        return {};
    }
};

async function setupBot(client) {
    client.slashCommands = new Collection();
    client.prefixCommands = new Collection();

    client.once('ready', async () => {
        console.log(`LIN | ${client.user.tag}`);
        logMessage(`Bot ${client.user.tag} has logged in`, 'Bot Startup');

        client.user.setPresence({
            activities: [{ name: config.status, type: ActivityType.Watching }],
            status: 'idle',
        });

        await loadSlashCommands(client);
        await loadTextCommands(client);
        console.log(`Loaded ${client.slashCommands.size} slash commands and ${client.prefixCommands.size} prefix commands`);

        petty(client);
        startAnimeWatcher(client);
        console.log('Bot is fully ready!');
    });

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand()) return;

        const userId = interaction.user.id;
        const ban = isUserBanned(userId);
        if (ban) {
            return await interaction.reply({ embeds: [createBanEmbed(ban.reason)], ephemeral: true });
        }

        const command = client.slashCommands.get(interaction.commandName);
        if (!command) {
            await interaction.reply({ content: 'Command not found or still loading. Please try again shortly.', ephemeral: true });
            return;
        }

        try {
            await command.execute(interaction);
            updateCommandUsage(interaction.commandName);
        } catch (error) {
            console.error('Slash command error:', error);
            logMessage(`Error executing command: ${interaction.commandName}\nError: ${error.message}`, 'Command Execution');

            const errorCode = logError('C', 'S', error);
            await interaction.reply({ embeds: [createErrorEmbed(errorCode, 'Critical')], ephemeral: true });
        }
    });

    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;
        const prefix = config.prefix.toLowerCase();
        const content = message.content.toLowerCase();
        if (!content.startsWith(prefix)) return;
        const commandPart = content.slice(prefix.length).trim();
        const isPrefixedCommand = commandPart.startsWith('prefix-');
        const parts = commandPart.match(/(\S+)\s*(.*)/);
        if (!parts) return;
        const commandName = isPrefixedCommand ? parts[1].slice(7).trim() : parts[1];
        const command = client.prefixCommands.get(commandName);
        if (!command) return;
        const userId = message.author.id;
        const ban = isUserBanned(userId);
        if (ban) {
            return await message.reply({ embeds: [createBanEmbed(ban.reason)], ephemeral: true });
        }

        const args = (parts[2] || '').trim().split(/ +/);
        if (message.guild) {
            const guildId = message.guild.id;
            const isOwner = message.guild.ownerId === userId;
            const allowCmdData = loadAllowCmd();

            if (!command.public) {
                const guildConfig = allowCmdData[guildId];
                if (guildConfig) {
                    const allowedRoles = Array.isArray(guildConfig.allow) ? guildConfig.allow : [];
                    const hasAllowedRole = allowedRoles.length > 0 && message.member.roles.cache.some(role => allowedRoles.includes(role.id));
                    if (!isOwner && !hasAllowedRole) {
                        return;
                    }
                } else {
                    if (!isOwner) {
                        return;
                    }
                }
            }
        }

        try {
            await command.execute(message, args);
            updateCommandUsage(commandName);
        } catch (error) {
            console.error('Text command error:', error);
            logMessage(`Error executing command: ${commandName}\nError: ${error.message}`, 'Command Execution');
            const errorCode = logError('M', 'P', error);
            await message.reply({ embeds: [createErrorEmbed(errorCode, 'Medium')] });
        }
    });
}

module.exports = { setupBot };