const Data = require('../models/Data')
const { MessageEmbed, WebhookClient } = require('discord.js')
const { embed } = require('../embed')
module.exports = {
	name: 'roleCreate',
	once: false,
	async execute(role, client) {
		let resualt = await Data.findOne({ guildId: role.guild.id })
		if (!resualt) return;
		if (!resualt.log.role) return;
		const webhook = role.guild.channels.cache.get(resualt.log.role)
		if(!role.guild.channels.cache.get(webhook.id))return;
		const fetchedLogs = await role.guild.fetchAuditLogs({
			limit: 1,
			type: 'ROLE_CREATE',
		});


		const deletionLog = fetchedLogs.entries.first();

		const { executor } = deletionLog;
if(!executor ) return;
		embed.setTitle(`Role Log`)
		if (!deletionLog) {
			embed.setDescription(` A role created by Unknown user
Name : ${role.name}
Color : ${role.color}
ID : ${role.id}
			`)
		} else {
			embed.setDescription(` A role created by ${executor.tag} user
			Name : ${role.name}
			Color : ${role.color}
			ID : ${role.id}
						`)
		}

		webhook.send({ embeds: [embed] })
	},
};