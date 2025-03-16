const { AttachmentBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');
const fetch = require('node-fetch');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const animeTrackPath = path.join(__dirname, '../DB/Internal_Config/anime_track.json');

function initializeAnimeTrack() {
    if (!fs.existsSync(animeTrackPath) || fs.readFileSync(animeTrackPath, 'utf8').trim() === '') {
        fs.writeFileSync(animeTrackPath, JSON.stringify({ nextSend: Math.floor(Date.now() / 1000) + 86400 }, null, 2));
    }
}

function getAnimeTrack() {
    initializeAnimeTrack();
    return JSON.parse(fs.readFileSync(animeTrackPath));
}

function updateNextSend(nextSendTime) {
    fs.writeFileSync(animeTrackPath, JSON.stringify({ nextSend: nextSendTime }, null, 2));
}

async function sendAnimeMessage(channel) {
    const response = await fetch('https://nekos.best/api/v2/neko');
    const json = await response.json();
    const result = json.results[0];
    const imageUrl = result.url;
    const artistName = result.artist_name;
    const artistUrl = result.artist_href;
    const sourceUrl = result.source_url;

    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const attachment = new AttachmentBuilder(Buffer.from(imageBuffer), { name: 'neko.png' });

    const { dominant } = await sharp(Buffer.from(imageBuffer)).stats();
    const dominantColor = `#${((1 << 24) + (dominant.r << 16) + (dominant.g << 8) + dominant.b).toString(16).slice(1).padStart(6, '0')}`;

    const embed = new EmbedBuilder()
        .setColor(dominantColor)
        .setAuthor({ name: artistName, url: artistUrl })
        .setImage('attachment://neko.png')
        .setDescription(`> Follow this channel to get\n> daily nekos posted to your server!\n> Next post: <t:${getAnimeTrack().nextSend}:R>`);

    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('Image Source')
                .setStyle(ButtonStyle.Link)
                .setURL(sourceUrl),
            new ButtonBuilder()
                .setLabel('Image Author')
                .setStyle(ButtonStyle.Link)
                .setURL(artistUrl)
        );

    await channel.send({
        embeds: [embed],
        files: [attachment],
        components: [buttons]
    });
}

function startAnimeWatcher(client) {
    const channelId = config.animeChannel;
    if (!channelId) return;

    const channel = client.channels.cache.get(channelId);
    if (!channel) return;

    const interval = 86400000;
    const animeTrack = getAnimeTrack();
    const now = Date.now();
    const nowInSeconds = Math.floor(now / 1000);
    let delay = (animeTrack.nextSend - nowInSeconds) * 1000;

    if (delay <= 0) {
        delay = interval;
        updateNextSend(nowInSeconds + 86400);
    }

    function scheduleNext() {
        const nextSendTime = Math.floor(Date.now() / 1000) + 86400;
        updateNextSend(nextSendTime);
        sendAnimeMessage(channel)
            .then(() => {
                setTimeout(scheduleNext, interval);
            })
            .catch(error => {
                console.error('Failed to send anime message, rescheduling:', error);
                setTimeout(scheduleNext, interval);
            });
    }

    setTimeout(scheduleNext, delay);
}

module.exports = { startAnimeWatcher };