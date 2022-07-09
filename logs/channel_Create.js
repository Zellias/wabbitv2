const Data = require('../models/Data')
const { MessageEmbed, WebhookClient } = require('discord.js')
const { embed } = require('../embed')
const moment = require('moment')
module.exports = {
	name: 'channelCreate',
	once: false,
	async execute(channel,client) {
		let resualt = await Data.findOne({ guildId: channel.guild.id })
        if (!resualt) return;
        if (!resualt.log.channel) return;
        const webhook = channel.guild.channels.cache.get(resualt.log.channel)
		if(!channel.guild.channels.cache.get(webhook.id))return;
		const fetchedLogs = await channel.guild.fetchAuditLogs({
			limit: 1,
			type: 'CHANNEL_CREATE',
		});
	
		const deletionLog = fetchedLogs.entries.first();
		if (!deletionLog) return console.log(`Not Found`);
		embed.setTitle(`Channel Log`)
		const { executor } = deletionLog;
if(!executor ) return;
		embed.setDescription(`
${channel} [${channel.id}] **Channel created by** \`${executor.tag}\` [${executor.id}]
		`)
		webhook.send({ embeds: [embed] })
	},
};