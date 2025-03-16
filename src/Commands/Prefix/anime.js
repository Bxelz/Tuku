const { AttachmentBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../../config.json");
const fetch = require('node-fetch');
const sharp = require('sharp');

module.exports = {
    name: "anime",
    aliases: ["a"],
    description: "An anime command. ランダムな安全なアニメ画像を取得します。",
    public: true,
    async execute(message) {
        try {
            const response = await fetch("https://nekos.best/api/v2/neko");
            const json = await response.json();
            const result = json.results[0];
            const imageUrl = result.url;
            const artistName = result.artist_name;
            const artistUrl = result.artist_href;
            const sourceUrl = result.source_url;

            const imageResponse = await fetch(imageUrl);
            const imageBuffer = await imageResponse.arrayBuffer();
            const attachment = new AttachmentBuilder(Buffer.from(imageBuffer), { name: "neko.png" });

            const { dominant } = await sharp(Buffer.from(imageBuffer)).stats();
            const dominantColor = `#${((1 << 24) + (dominant.r << 16) + (dominant.g << 8) + dominant.b).toString(16).slice(1).padStart(6, '0')}`;

            const embed = new EmbedBuilder()
                .setColor(dominantColor)
                .setAuthor({ name: artistName, url: artistUrl })
                .setImage("attachment://neko.png")
                .setDescription(`<a:catnomscherryblossom:1350269511508557897> Want this too? Add [${config.name}](https://discord.com/oauth2/authorize?client_id=1298028637748199507&redirect_uri=https://wamoone.com/login&response_type=code&scope=identify+email+guilds+bot&permissions=1634200972406) to your server!`);

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

            await message.reply({
                embeds: [embed],
                files: [attachment],
                components: [buttons]
            });
        } catch (error) {
            console.error("Error fetching or sending anime image:", error);
            await message.channel.send("Failed to fetch an anime image. Try again later!");
        }
    }
};