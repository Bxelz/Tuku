const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meow')
        .setDescription('meow')
        .setDefaultMemberPermissions(0),
    async execute(interaction) {
        await interaction.reply('meow');
    },
};