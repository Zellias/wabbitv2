const Data = require('../models/Data')
const { MessageEmbed, WebhookClient } = require('discord.js')
const { embed } = require('../embed')
const moment = require('moment')
module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member,client) {
        let resualt = await Data.findOne({ guildId: member.guild.id })
        if (!resualt) return;
        if (!resualt.log.join_leave) return;
        const webhook = member.guild.channels.cache.get(resualt.log.join_leave)
        if(!member.guild.cache.get(webhook.id))return;
        embed.setTitle(`Join Log`)
        embed.setDescription(`**A Member has joined the server**
Username : ${member.user.username}
ID : ${member.user.id}
User Creation Date : \`${moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}\`


`)
        webhook.send({ embeds: [embed] })
    },
};