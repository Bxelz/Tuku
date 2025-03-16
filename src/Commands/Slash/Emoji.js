const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const unzipper = require('unzipper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addemojis')
        .setDescription('Add emojis to the server from an attachment.')
        .addAttachmentOption(option =>
            option
                .setName('file')
                .setDescription('Upload a single emoji file or a zip folder of emojis.')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageEmojisAndStickers)) {
            return await interaction.reply({
                content: 'You need the "Manage Emojis and Stickers" permission to use this command.',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        const attachment = interaction.options.getAttachment('file');
        const fileName = attachment.name;
        const fileUrl = attachment.url;

        try {
            const response = await fetch(fileUrl);
            const buffer = Buffer.from(await response.arrayBuffer());

            if (fileName.endsWith('.zip')) {
                const tempDir = path.join(__dirname, 'temp_emojis');
                await fs.mkdir(tempDir, { recursive: true });
                const zipStream = require('stream').Readable.from(buffer).pipe(unzipper.Extract({ path: tempDir }));
                await new Promise((resolve) => zipStream.on('close', resolve));

                const files = await fs.readdir(tempDir);
                const imageFiles = files.filter(f => /\.(png|jpg|jpeg|gif)$/i.test(f));

                if (imageFiles.length === 0) {
                    await interaction.editReply({ content: 'No valid image files found in the zip.', ephemeral: true });
                    await fs.rm(tempDir, { recursive: true, force: true });
                    return;
                }

                await interaction.editReply({ content: `Found ${imageFiles.length} emojis. Adding them one by one...`, ephemeral: true });
                for (const [index, file] of imageFiles.entries()) {
                    const emojiName = path.parse(file).name.replace(/[^a-zA-Z0-9_]/g, '');
                    const filePath = path.join(tempDir, file);
                    const fileBuffer = await fs.readFile(filePath);

                    try {
                        await interaction.guild.emojis.create({
                            attachment: fileBuffer,
                            name: emojiName || `emoji_${index}`
                        });
                        await new Promise(resolve => setTimeout(resolve, 4000));
                    } catch (error) {
                        console.error(`Error adding emoji ${emojiName}:`, error);
                        await interaction.followUp({ content: `Failed to add ${emojiName}: ${error.message}`, ephemeral: true });
                    }
                }

                await interaction.followUp({ content: 'Finished adding emojis from the folder!', ephemeral: true });
                await fs.rm(tempDir, { recursive: true, force: true });
            } else if (/\.(png|jpg|jpeg|gif)$/i.test(fileName)) {
                const emojiName = path.parse(fileName).name.replace(/[^a-zA-Z0-9_]/g, '');

                await interaction.guild.emojis.create({
                    attachment: buffer,
                    name: emojiName
                });

                await interaction.editReply({ content: `Added emoji \`:${emojiName}:\` successfully!`, ephemeral: true });
            } else {
                await interaction.editReply({ content: 'Please upload a valid image file (PNG/JPG/GIF) or a ZIP folder.', ephemeral: true });
            }
        } catch (error) {
            console.error('Error in addemojis command:', error);
            await interaction.editReply({ content: `An error occurred: ${error.message}`, ephemeral: true });
        }
    },
};