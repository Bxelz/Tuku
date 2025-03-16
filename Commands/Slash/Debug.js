const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');
const os = require('os');
const config = require('../../config.json');
const fetch = require('node-fetch');

function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
}

function formatMemory(bytes) {
    const gb = bytes / 1024 / 1024 / 1024;
    return gb >= 1 ? `${gb.toFixed(2)}GB` : `${(bytes / 1024 / 1024).toFixed(2)}MB`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('debug')
        .setDescription(`Returns ${config.name}'s debug panel.`),
    async execute(interaction) {
        const client = interaction.client;
        const uptime = client.uptime ? formatUptime(client.uptime) : 'N/A';
        const guildCount = client.guilds.cache.size;
        const userCount = client.users.cache.size;
        const memoryUsed = formatMemory(process.memoryUsage().heapUsed);
        const memoryTotal = formatMemory(os.totalmem());
        const cpuUsage = process.cpuUsage().user;
        const cpuTotal = os.cpus().length * 1000000;
        const cpuPercent = ((cpuUsage / cpuTotal) * 100).toFixed(2);
        const boldWhite = '\u001b[1;37m';
        const cyan = '\u001b[0;36m';
        const white = '\u001b[0;37m';
        const reset = '\u001b[0m';

        let apiStatus = 'Down';
        let apiPing = 'N/A';
        const apiStartTime = Date.now();

        try {
            const apiResponse = await fetch('https://nekos.best/api/v2/endpoints');
            const apiEndTime = Date.now();
            apiPing = `${apiEndTime - apiStartTime}ms`;

            if (apiResponse.ok) {
                await apiResponse.json();
                apiStatus = `Serving (${apiPing})`;
            } else {
                apiStatus = `Down (${apiPing})`;
            }
        } catch (error) {
            const apiEndTime = Date.now();
            apiPing = `${apiEndTime - apiStartTime}ms`;
            apiStatus = `Down (${apiPing})`;
            console.error('API fetch error:', error);
        }

        const guild = client.guilds.cache.get(config.server);
        const serverName = guild ? guild.name : 'Unknown Server';
        const serverUserCount = guild ? guild.memberCount : 'N/A';
        const serverBoostLevel = guild ? guild.premiumTier : 'N/A';
        const serverBoostCount = guild ? guild.premiumSubscriptionCount : 'N/A';

        const debugContent = '```ansi\n' +
            `${boldWhite}Network${reset}\n` +
            `${cyan}Latency:${reset} ${white}${client.ws.ping}ms${reset}\n` +
            `${cyan}Heartbeat:${reset} ${white}${client.ws.ping}ms${reset}\n` +
            `${cyan}API:${reset} ${white}${apiStatus}${reset}\n\n` +
            `${boldWhite}System${reset}\n` +
            `${cyan}RAM:${reset} ${white}${memoryUsed} / ${memoryTotal}${reset}\n` +
            `${cyan}CPU:${reset} ${white}${cpuPercent}%${reset}\n\n` +
            `${boldWhite}${serverName}${reset}\n` +
            `${cyan}Users:${reset} ${white}${serverUserCount}${reset}\n` +
            `${cyan}Boost Level:${reset} ${white}${serverBoostLevel}${reset}\n` +
            `${cyan}Boosts:${reset} ${white}${serverBoostCount}${reset}\n` +
            '```';

        const embed = new EmbedBuilder()
            .setTitle(`${config.name}'s Debug Panel`)
            .setColor(config.color || '#00FF00')
            .setDescription(debugContent)
            .setFooter({ text: `Requested by ${interaction.user.displayName}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        try {
            await interaction.reply({ embeds: [embed], flags: 64 });
        } catch (error) {
            console.error('Error sending debug embed:', error);
            await interaction.reply('Failed to generate debug info. Check bot logs.');
        }
    },
};