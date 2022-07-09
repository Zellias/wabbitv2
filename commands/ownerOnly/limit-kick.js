const { SlashCommandBuilder } = require('@discordjs/builders');
const { Z_ASCII } = require('node:zlib');
const { dev } = require(
    '../../config/config.json'
)
const { addGuildToDataBase } = require('../../addGuild')
const Data = require('../../models/Data')
const wait = require('node:timers/promises').setTimeout;
module.exports = {
    data: new SlashCommandBuilder()
        .setName('limit-kick')
        .setDescription('Set Limits of kick ')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Set Limits of kick Members')
                .addIntegerOption(option => option.setName('limit').setDescription('Enter Limit Number').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Change anti channel status [ON/OFF]')
                .addStringOption(option =>
                    option.setName('value')
                        .setDescription('ON / OFF')
                        .setRequired(true)
                        .addChoices({
                            name: 'ON',
                            value: 'on'
                        })
                        .addChoices({
                            name: 'OFF',
                            value: 'off'
                        })
                )
        ),
    async execute(interaction) {
        const { embed } = require('../../embed')
        embed.setTitle('Settings Updated !')


        let owner = await interaction.guild.fetchOwner()
        if (interaction.user.id !== owner.id && !dev.includes(interaction.user.id)) {
            return interaction.reply('You are not ownership or bot developer')
        }
        let resualt = await Data.findOneAndUpdate({ guildId: interaction.guild.id })    
        if (!resualt) {
            await addGuildToDataBase(interaction.guild.id)
        } 
        let sub = interaction.options.getSubcommand()
      
        switch (sub) {
            case 'add':
                const channeCreate = interaction.options.getInteger('limit');

                resualt.limit.kick.add = channeCreate
                await resualt.save()

                embed.setDescription(`
                <:983651050911313941:983651050911313941> | kick Limit has sucsessfully set to ${channeCreate}
            `)
                await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });



                break;
            default:
                var value = interaction.options.get('value').value
                console.log(value)
                if (value === 'on') {
                    resualt.limit.kick.isEnable = true
                    await resualt.save()
                    embed.setDescription(`
                    <:983651050911313941:983651050911313941> |  Anti kick Status has successfully set to ${value}
                        `)
                    await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });
                } else if (value === 'off') {
                    resualt.limit.kick.isEnable = false
                    await resualt.save()
                    embed.setDescription(`
                    <:983651050911313941:983651050911313941> | Anti kick Status has successfully set to ${value}
                        `)
                        await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });
                }
                
                break;
        }








    },
};