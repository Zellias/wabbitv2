const Data = require('../models/Data')
const { MessageEmbed, WebhookClient } = require('discord.js')
const { embed } = require('../embed')
const moment = require('moment')
module.exports = {
	name: 'guildBanAdd',
	once: false,
async	execute(ban,client) {
		let resualt = await Data.findOne({ guildId: ban.guild.id })
        if (!resualt) return;
        if (!resualt.log.ban) return;
        const webhook = ban.channels.cache.get(resualt.log.ban)
		if(!ban.guild.channels.cache.get(webhook.id))return;
		const fetchedLogs = await ban.guild.fetchAuditLogs({
			limit: 1,
			type: 'MEMBER_BAN_ADD',
		});
	
	
	
		const deletionLog = fetchedLogs.entries.first();
		if (!deletionLog) return console.log(`Not Found`);
	
		const { executor } = deletionLog;
if(!executor ) return;
		embed.setTitle('Ban Log')
		embed.setDescription(`${executor.tag}[${executor.id}] banned ${ban.user.tag}[${ban.user.id}]`)
		webhook.send({ embeds: [embed] })
	},
};