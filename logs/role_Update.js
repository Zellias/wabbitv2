const Data = require('../models/Data')
const { MessageEmbed, WebhookClient } = require('discord.js')
const { embed } = require('../embed')
   module.exports = {
        name: 'roleUpdate',
        once: false,
      async  execute(oldRole,newRole,client) {
        const resualt = await Data.findOne({ guildId: oldRole.guild.id });
        if (!resualt) return;
        if (!resualt.log.role) return;
        const webhook = role.guild.channels.cache.get(resualt.log.role)
        if(!role.guild.channels.cache.get(webhook.id))return;
        if (oldRole.permissions !== newRole.permissions) {
            const oldPerms = oldRole.permissions.serialize();
            const newPerms = newRole.permissions.serialize();
         
           
            const permUpdated = [];
            const permLose = [];
            const fetchedLogs = await newRole.guild.fetchAuditLogs({
                limit: 1,
                type: 'ROLE_UPDATE',
            });
    
            const banLog = fetchedLogs.entries.first();
    
    
            if (!banLog) return console.log(` no audit log could be found.`);
    
    
            const { executor } = banLog;

                for (const [key, element] of Object.entries(oldPerms)) {
                    if (newPerms[key] !== element) permUpdated.push(key);
                }
                for (const [key, element] of Object.entries(newPerms)) {
                    if (oldPerms[key] !== element) permLose.push(key);
                }
                embed.setTitle('Role Log')
                embed.setDescription(`**${oldRole.name} Role Updated By **${executor.tag}[${executor.id}]
                **New Information** :
> **Name** : ${newRole.name}
> **ID** : ${newRole.id}
**Updated role permissions**
\`\`\`${permUpdated}\`\`\`
                `)
                webhook.send({ embeds: [embed] })
            
        }
        },
    };