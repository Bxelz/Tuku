const { Events } = require('discord.js');

const petty = (client) => {
    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot) return;

        const botId = '565852514033860629(';
        const isMentioned = message.mentions.has(botId);
        const isReply = message.reference && message.mentions.repliedUser?.id === botId;
        if (isMentioned || isReply) {
            const hasEveryone = message.mentions.everyone;
            const hasHere = message.content.includes('@here');
            if (hasEveryone || hasHere) return;
            if (message.guild) {
                const botMember = message.guild.members.cache.get(client.user.id);
                if (botMember?.permissions.has('MANAGE_MESSAGES')) {
                    try {
                        await message.delete();
                    } catch (error) {
                        console.error('Failed to delete message:', error);
                    }
                }
            }
        }
    });
};

module.exports = petty;