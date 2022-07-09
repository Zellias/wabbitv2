const { SlashCommandBuilder } = require('@discordjs/builders');
const { Z_ASCII } = require('node:zlib');
const { dev } = require(
    '../../config/config.json'
)
const { client } = require('../../index')
const { addGuildToDataBase } = require('../../addGuild')
const { embed } = require('../../embed')
const Data = require('../../models/Data')
const wait = require('node:timers/promises').setTimeout;
module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('check server settings !')
    ,
    async execute(interaction) {
        embed.setTitle(`${interaction.guild.name} Settings !`)


        let owner = await interaction.guild.fetchOwner()
        if (interaction.user.id !== owner.id && !dev.includes(interaction.user.id)) {
            return interaction.reply('You are not ownership or bot developer')
        }


        let resualt = await Data.findOne({ guildId: interaction.guild.id })
        if (!resualt) {
            await addGuildToDataBase(interaction.guild.id)
        }









        let txy = ''
        if (resualt.limit.channel.isEnable == true) {
            txy += `\n**> Channel Limit Status : <:983653503278919770:983653503278919770>**`
        } else {
            txy += `\n**> Channel Limit Status : <:983653828090032168:983653828090032168>**`
        }
        if (resualt.limit.channel.create == null) {
            txy += `\n- Channel Creation Limit :  <:983635028867162112:983635028867162112>`
        } else {
            txy += `\n- Channel Creation Limit : ${resualt.limit.channel.create}`
        }

        if (resualt.limit.channel.delete == null) {
            txy += `\n- Channel Deletion  Limit :  <:983635028867162112:983635028867162112>`
        } else {
            txy += `\n- Channel Deletion  Limit : ${resualt.limit.channel.delete}`
        }




        if (resualt.limit.role.isEnable) {
            txy += `\n**> Role Limit Status : <:983653503278919770:983653503278919770>**`
        } else {
            txy += `\n**> Role Limit Status : <:983653828090032168:983653828090032168>**`
        }
        if (resualt.limit.role.create == null) {
            txy += `\n- Role Creation Limit :  <:983635028867162112:983635028867162112>`
        } else {
            txy += `\n- Role Creation Limit : ${resualt.limit.role.create}`
        }

        if (resualt.limit.role.delete == null) {
            txy += `\n- Role Deletion  Limit :  <:983635028867162112:983635028867162112>`
        } else {
            txy += `\n- Role Deletion  Limit : ${resualt.limit.role.delete}`
        }

        if (resualt.limit.role.update == null) {
            txy += `\n- Role Update Limit :  <:983635028867162112:983635028867162112>`
        } else {
            txy += `\n- Role Update Limit : ${resualt.limit.role.update}`
        }

        if (resualt.limit.kick.isEnable) {
            txy += `\n**> Kick Limit Status : <:983653503278919770:983653503278919770>**`
        } else {
            txy += `\n**> Kick Limit Status : <:983653828090032168:983653828090032168>**`
        }
        if (resualt.limit.kick.add == null) {
            txy += `\n- Kick Limit :  <:983635028867162112:983635028867162112>`
        } else {
            txy += `\n- Kick Limit : ${resualt.limit.kick.add}`
        }

        if (resualt.limit.ban.isEnable) {
            txy += `\n**> Ban Limit Status : <:983653503278919770:983653503278919770>**`
        } else {
            txy += `\n**> Ban Limit Status : <:983653828090032168:983653828090032168>**`
        }

        if (resualt.limit.ban.add == null) {
            txy += `\n- Ban Limit :  <:983635028867162112:983635028867162112>`
        } else {
            txy += `\n- Ban Limit : ${resualt.limit.ban.add}`
        }

        if (resualt.punishment == null) {
            txy += `\n**> Punishment :  <:983635028867162112:983635028867162112>**\n`
        } else {
            txy += `\n**> Punishment : ${resualt.punishment}**\n`

        }
        if (resualt.ability.anti_bot) {
            txy += `\n** Anti Bot Status : <:983653503278919770:983653503278919770>**`
        } else {
            txy += `\n** Anti Bot Status : <:983653828090032168:983653828090032168>**`
        }


        if (resualt.ability.channel_freeze) {
            txy += `\n** Channel Freeze Status : <:983653503278919770:983653503278919770>**`
        } else {
            txy += `\n** Channel Freeze Status : <:983653828090032168:983653828090032168>**`
        }
        if (resualt.ability.anti_dang_role_perm) {
            txy += `\n** Anti Role Dangerous Permission Status : <:983653503278919770:983653503278919770>**`
        } else {
            txy += `\n** Anti Role Dangerous Permission Status : <:983653828090032168:983653828090032168>**`
        }

        
        if(resualt.ability.anti_link){
            txy += `\n** Anti Link Status : <:983653503278919770:983653503278919770>**`
        }else{
            txy += `\n** Anti Link Status : <:983653828090032168:983653828090032168>**`
        }
        if(resualt.ability.anti_ghost_ping){
            txy += `\n** Anti Ghost Ping Status : <:983653503278919770:983653503278919770>**`
        }else{
            txy += `\n** Anti Ghost Ping Status : <:983653828090032168:983653828090032168>**`
        }
        
        txy += `\n\n**+ <:983635028867162112:983635028867162112> Means that option is not set yet !** **Please set that !**`
        embed.setDescription(txy)
        await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true }).then().catch(err => {console.log(err)}).then().catch(async err => {
            await interaction.reply({ content: `${interaction.user} Retry Command!`, ephemeral: true }).then().catch(err => {console.log(err)})
        });






    },
};