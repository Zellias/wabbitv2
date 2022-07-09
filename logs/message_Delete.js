const Data = require('../models/Data')
const { MessageEmbed, WebhookClient } = require('discord.js')
const { embed } = require('../embed')
module.exports = {
    name: 'messageDelete',
    once: false,
    async execute(message, client) {
        let resualt = await Data.findOne({ guildId: message.guild.id })
        if (!resualt) return;
        if (!resualt.log.message) return;
        const webhook = message.guild.channels.cache.get(message.guild.id)
        if(!message.guild.channels.cache.get(webhook.id))return;
        embed.setTitle(`Message Log`)
        embed.setDescription(`A message sent by **${message.author.tag} [${message.author.id}]** deleted in **${message.channel}** channel !
        Message Content :
\`\`\`
${message.content}
\`\`\`
`)
        webhook.send({ embeds: [embed] })
    },
};