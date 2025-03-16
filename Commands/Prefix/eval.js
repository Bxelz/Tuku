// IF YOU'RE GOING TO USE THIS, BE CAREFUL...
const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'code-eval',
    aliases: ['eval', 'ce'],
    description: 'Evaluates JavaScript code (trusted users only).',
    public: false,
    async execute(message, args) {
        const userId = message.author.id;
        const trustedUsers = config.trusted_users || [];

        if (!trustedUsers.includes(userId)) {
            const audioPath = path.join(__dirname, '../../Assets/Audio/eval.mp3');
            try {
                await message.reply({ files: [{ attachment: audioPath, name: 'eval.mp3' }] });
            } catch (error) {
                console.error('Failed to send evaluation result.', error);
                await message.reply('An error o');
            }
            return;
        }

        const code = args.join(' ');
        if (!code) {
            return message.reply('Please provide some code to evaluate.');
        }

        let result;
        let error = false;

        try {
            result = eval(code);
            if (typeof result === 'object') result = JSON.stringify(result, null, 2);
        } catch (err) {
            result = err.message;
            error = true;
        }

        let embed;
        if (!error && result === config.token) {
            const halfLength = Math.floor(result.length / 2);
            const maskedResult = `${result.slice(0, halfLength)}...`;
            embed = new EmbedBuilder()
                .setTitle('Code Evaluation')
                .setColor('Green')
                .addFields(
                    { name: 'Input', value: `\`\`\`js\n${code}\n\`\`\`` },
                    { name: 'Output', value: `\`\`\`\n${maskedResult}\n\`\`\`` }
                )
                .setFooter({ text: `Requested by ${message.author.displayName}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();
        } else {
            embed = new EmbedBuilder()
                .setTitle('Code Evaluation')
                .setColor(error ? 'Red' : 'Green')
                .addFields(
                    { name: 'Input', value: `\`\`\`js\n${code}\n\`\`\`` },
                    { name: error ? 'Error' : 'Output', value: `\`\`\`\n${result || 'No output'}\n\`\`\`` }
                )
                .setFooter({ text: `Requested by ${message.author.displayName}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();
        }

        try {
            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error sending embed:', error);
            await message.reply('Failed to send evaluation result.');
        }
    },
};