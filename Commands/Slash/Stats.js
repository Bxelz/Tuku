const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Displays stats for the server.'),
    async execute(interaction) {
        try {
            const guild = interaction.guild;
            if (!guild) {
                await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
                return;
            }

            await guild.members.fetch();
            const owner = guild.ownerId;
            const totalMemberCount = guild.memberCount;
            const botCount = guild.members.cache.filter(member => member.user.bot).size;
            const humanMemberCount = totalMemberCount - botCount;
            const boostLevel = guild.premiumTier;
            const boostCount = guild.premiumSubscriptionCount || 0;
            const creationDate = Math.floor(guild.createdTimestamp / 1000);

            const publicChannels = guild.channels.cache.filter(ch => 
                ch.type !== 'GUILD_PRIVATE_THREAD' && 
                ch.permissionsFor(guild.roles.everyone).has(PermissionFlagsBits.ViewChannel)
            ).size;
            const privateChannels = guild.channels.cache.filter(ch => 
                !ch.permissionsFor(guild.roles.everyone).has(PermissionFlagsBits.ViewChannel)
            ).size;
            const roleCount = guild.roles.cache.size;

            const admins = guild.members.cache
                .filter(member => !member.user.bot && member.permissions.has(PermissionFlagsBits.Administrator))
                .map(member => `<@${member.id}>`)
                .join(', ') || 'None';

            const embed = new EmbedBuilder()
                .setTitle(guild.name)
                .setDescription('Here are the stats for this server (;')
                .setColor(config.color || '#00FF00')
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .addFields(
                    { name: 'Core Details', value: [
                        `**Server Owner:** <@${owner}>`,
                        `**Total Server Members:** \`${humanMemberCount}\``,
                        `**Total Server Applications:** \`${botCount}\``,
                        `**Current Server Boost Level:** \`${boostLevel} (${boostCount})\``,
                        `**Server Creation Date:** <t:${creationDate}:F>`
                    ].join('\n'), inline: false },
                    { name: 'Server Overview', value: [
                        `**Total Public Channels:** \`${publicChannels}\``,
                        `**Total Private Channels:** \`${privateChannels}\``,
                        `**Total Roles:** \`${roleCount}\``
                    ].join('\n'), inline: false },
                    { name: 'Administration', value: `**Admins:** ${admins}`, inline: false }
                )
                .setFooter({ text: `Requested by ${interaction.user.displayName}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in stats command:', error);
            try {
                await interaction.reply({ content: 'Failed to fetch server stats. Please try again later.', ephemeral: true });
            } catch (replyError) {
                console.error('Error sending reply:', replyError);
            }
        }
    },
};