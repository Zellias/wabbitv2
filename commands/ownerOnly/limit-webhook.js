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
        .setName('limit-webhook')
        .setDescription('Set Limits of webhook actions ')
        .addSubcommand(subcommand =>
            subcommand
                .setName('actions')
                .setDescription('Set Limits of webhook actions')
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
            case 'actions':
                const channeCreate = interaction.options.getInteger('limit');

                resualt.limit.webhook.action = channeCreate
                await resualt.save()

                embed.setDescription(`
                <:983651050911313941:983651050911313941> | Webhook actions Limit has sucsessfully set to ${channeCreate}
            `)
                await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });



                break;
            default:
                var value = interaction.options.get('value').value
                console.log(value)
                if (value === 'on') {
                    resualt.limit.webhook.isEnable = true
                    await resualt.save()
                    embed.setDescription(`
                    <:983651050911313941:983651050911313941> |  Webhook actions Status has successfully set to ${value}
                        `)
                    await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });
                } else if (value === 'off') {
                    resualt.limit.webhook.isEnable = false
                    await resualt.save()
                    embed.setDescription(`
                    <:983651050911313941:983651050911313941> | Webhook actions Status has successfully set to ${value}
                        `)
                        await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });
                }
                break;
        }








    },
};