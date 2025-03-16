const { WebhookClient, EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const webhook = new WebhookClient({ url: 'https://discord.com/api/webhooks/1350591840994201631/AwJ_dDeB4UKBcA7eLOCGN6N0MUOr_BMt-WPpdKzXuz9XNlxrbqmrBoCp7tug4q551utX' });

const logMessage = async (message, filename = 'Console') => {
    let color = 'Blue';
    if (filename === 'Error Log') color = 'Red';
    else if (filename === 'Warning Log') color = 'Orange';
    else if (filename === 'Console Log') color = 'Green';

    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`${config.name}'s Console (${filename})`)
        .setDescription(`${config.name} has ported a console message:\n\`\`\`bash\n${message}\`\`\``);

    try {
        await webhook.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error sending log to Discord:', error);
    }
};

console.log = (...args) => {
    const message = args.join(' ');
    logMessage(message, 'Console Log');
    process.stdout.write(message + '\n');
};

console.error = (...args) => {
    const message = args.join(' ');
    logMessage(message, 'Error Log');
    process.stderr.write(message + '\n');
};

console.warn = (...args) => {
    const message = args.join(' ');
    logMessage(message, 'Warning Log');
    process.stderr.write(message + '\n'); 
};

module.exports = logMessage;
