const Data = require('../models/Data')
const { MessageEmbed, WebhookClient } = require('discord.js')
const { embed } = require('../embed')
module.exports = {
    name: 'messageUpdate',
    once: false,
    async execute(oldMessage, newMessage,client) {
        let resualt = await Data.findOne({ guildId: oldMessage.guild.id })
        if (!resualt) return;
        if (!resualt.log.message) return;
        const webhook = message.guild.channels.cache.get(message.guild.id)
        if(!message.guild.channels.cache.get(webhook.id))return;
        embed.setTitle(`Message Log`)
        embed.setDescription(`A message edited by **${oldMessage.author.tag} [${oldMessage.author.id}]** in **${oldMessage.channel}** channel !
Old Message Content :
\`\`\`
${oldMessage.content}
\`\`\`
New Message Content :
\`\`\`
${newMessage.content}
\`\`\`
`)
        webhook.send({ embeds: [embed] })
    },
};