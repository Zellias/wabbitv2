const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed,MessageActionRow,MessageButton } = require('discord.js')
const wait = require('node:timers/promises').setTimeout;
const Data = require('../../models/Data')
const { addGuildToDataBase } = require('../../addGuild')
const { embed } = require('../../embed')
const axios = require('axios')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('log')
        .setDescription('manage your server logs').addStringOption(option =>
            option.setName('log')
                .setDescription('Select log')
                .setRequired(true)
                .addChoices({
                    name: 'Channel',
                    value: 'channel'
                })
                .addChoices({
                    name: 'Role',
                    value: 'role'
                })
                // .addChoices({
                //     name: 'Emoji',
                //     value: 'emoji'
                // })
                .addChoices({
                    name: 'Kick',
                    value: 'kick'
                })
                .addChoices({
                    name: 'Ban',
                    value: 'ban'
                })
                .addChoices({
                    name: 'Message',
                    value: 'message'
                })
                // .addChoices({
                //     name: 'Server updates',
                //     value: 'guild_update'
                // })
                .addChoices({
                    name: 'Join & Leave',
                    value: 'join_leave'
                })
        ).addChannelOption(option =>
            option.setName('channel')
                .setDescription('Select Channel')
                .setRequired(true)
        ),

    async execute (interaction) {
        let resualt = await Data.findOneAndUpdate({ guildId: interaction.guild.id })
        if (!resualt) {
            await addGuildToDataBase(interaction.guild.id)
        }
        let log = interaction.options.get('log').value
        let channelOpt = interaction.options.get('channel').value
        let channel = interaction.guild.channels.cache.get(channelOpt)
        let owner = await interaction.guild.fetchOwner()
        if (interaction.user.id !== owner.id && !dev.includes(interaction.user.id)) {
            return interaction.reply('You are not ownership or bot developer')
        }
        if (channel.type !== 'GUILD_TEXT') return interaction.reply({ content: `Please Select Text Channel with \`#\` icon`, ephemeral: true })

       

            switch (log) {
                case 'channel':

                        resualt.log.channel = channelOpt
                        resualt.save()
                    
                    break;
                case 'role':
                        resualt.log.role = channelOpt
                        resualt.save()
                    break;
                // case 'emoji':
                //     if(resualt.log.emoji){
                //         await deleteWebhook(resualt.log.emoji)
                //         resualt.log.emoji = channelOpt
                //         resualt.save()
                //     }else{
                //         resualt.log.emoji = channelOpt
                //         resualt.save()
                //     }
                //     break;
                case 'kick':


                        resualt.log.kick = channelOpt
                        resualt.save()

                    break;
                case 'ban':

                        resualt.log.ban = channelOpt
                        resualt.save()

                    break;
                case 'message':


                        resualt.log.message = channelOpt
                        resualt.save()

                    break;
                // case 'guild_update':
                //     if(resualt.log.guild_update){
                //         await deleteWebhook(resualt.log.guild_update)
                //         resualt.log.guild_update = channelOpt
                //         resualt.save()
                //     }else{
                //         resualt.log.guild_update = channelOpt
                //         resualt.save()
                //     }
                //     break;
                case 'join_leave':
                        resualt.log.join_leave = channelOpt
                        resualt.save()

                    break;
                default:
                    break;
            }
            embed.setTitle('Log Action !')
            embed.setDescription(`
            <:983651050911313941:983651050911313941> |  ${log} setted to ${channel.name} channel
                `)
            await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });

    },
};