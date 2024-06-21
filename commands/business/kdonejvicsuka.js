const {SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kdonejvicsuka')
        .setDescription('Tak kdo tu nejvíc šuká?'),
    async execute(interaction) {
        const channel = interaction.guild.channels.cache.find(ch => ch.name === 'posting-šukačka-sticker-daily');
        if (!channel) {
            return interaction.reply('Channel "posting-šukačka-sticker-daily" not found.');
        }

        let messages;
        try {
            messages = await channel.messages.fetch();
        } catch (error) {
            console.error(error);
            return interaction.reply('Failed to fetch messages from the channel.');
        }

        const sukackaCount = {};

        messages.forEach(message => {
            if (message.author.bot) return;

            const hasEmote = hasSukackaEmote(message);
            const hasSticker = hasSukackaSticker(message);

            if (hasEmote || hasSticker) {
                if (!sukackaCount[message.author.tag]) {
                    sukackaCount[message.author.tag] = 0;
                }
                sukackaCount[message.author.tag] += 1;
            }
        });

        await interaction.reply(getLeaderboard(sukackaCount, interaction));
    },
};

function hasSukackaEmote(message) {
    return (message.content.match(/<:sukacka:\d+>/g) || []).length > 0;
}

function hasSukackaSticker(message) {
    return message.stickers.some(sticker => {
        return sticker.name === 'SUKACKA';
    });
}

function getLeaderboard(sukackaCount, interaction) {
    const sortedUsers = Object.entries(sukackaCount).sort((a, b) => b[1] - a[1]);

    let reply = '🏆 **ŽEBŘÍČEK ŠUKÁNÍ** 🏆\n\n';
    sortedUsers.forEach(([user, count], index) => {
        if (index === 0) {
            const member = interaction.guild.members.cache.find(member => member.user.tag === user);
            if (member) {
                reply += `🥇 <@${member.id}>: ${count}\n`;
            } else {
                reply += `🥇 ${user}: ${count}\n`;
            }
        } else {
            reply += `${index + 1}. ${user}: ${count}\n`;
        }
    });

    return reply;
}
