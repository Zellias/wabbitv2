const Data = require('../models/Data')
const { MessageEmbed, WebhookClient } = require('discord.js')
const { embed } = require('../embed')
const moment = require('moment')
module.exports = {
	name: 'guildMemberRemove',
	once: false,
async	execute(member,client) {
		let resualt = await Data.findOne({ guildId: member.guild.id })
        if (!resualt) return;
        if (!resualt.log.kick) return;
        const webhook = member.guild.channels.cache.get(resualt.log.kick)
	if(!member.guild.channels.cache.get(webhook.id))return;
		const fetchedLogs = await member.guild.fetchAuditLogs({
			limit: 1,
			type: 'MEMBER_KICK',
		});
	
	
	
		const deletionLog = fetchedLogs.entries.first();
		if (deletionLog.createdAt < member.joinedAt) return
		if (!deletionLog) return console.log(`Not Found`);
	
		const { executor } = deletionLog;
if(!executor ) return;
		if(!executor) return;
		embed.setTitle('Kick Log')
		embed.setDescription(`${executor.tag}[${executor.id}] Kicked ${member.user.tag}[${member.user.id}]`)
		webhook.send({ embeds: [embed] })
	},
};