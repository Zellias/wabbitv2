const { SlashCommandBuilder } = require('@discordjs/builders');
const { Z_ASCII } = require('node:zlib');
const { dev } = require(
    '../../config/config.json'
)
const { client } = require('../../index')
const { addGuildToDataBase } = require('../../addGuild')
const Data = require('../../models/Data')
const wait = require('node:timers/promises').setTimeout;
module.exports = {
    data: new SlashCommandBuilder()
        .setName('punish')
        .setDescription('Set Limits of ban ')
        .addStringOption(option =>
            option.setName('value')
                .setDescription('Enter Punishment mode')
                .setRequired(true)
                .addChoices({
                    name: 'RemoveRole',
                    value: 'removerole'
                })
                .addChoices({
                    name: 'Ban',
                    value: 'ban'
                })
                .addChoices({
                    name: 'Kick',
                    value: 'kick'
                })
        )


    ,

    async execute(interaction) {
        const { embed } = require('../../embed')
        embed.setTitle('Punish Action !')


        let owner = await interaction.guild.fetchOwner()
        if (interaction.user.id !== owner.id && !dev.includes(interaction.user.id)) {
            return interaction.reply('You are not ownership or bot developer')
        }

        
        let resualt = await Data.findOneAndUpdate({ guildId: interaction.guild.id })
        if (!resualt) {
            await addGuildToDataBase(interaction.guild.id)
        } 

        var value = interaction.options.get('value').value
        switch (value) {
            case 'removerole':
                console.log('rr')
                resualt.punishment = value
                await resualt.save()
                embed.setDescription(`
            <:983651050911313941:983651050911313941> | Punishment has successfully set to ${value}
            `)
                await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });

                break;
            case 'ban':
                console.log('ban')
                resualt.punishment = value
                await resualt.save()
                embed.setDescription(`
                <:983651050911313941:983651050911313941> | Punishment has successfully set to ${value}
                `)
                await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });


                break;
            case 'kick':
                console.log('kick')
                resualt.punishment = value
                await resualt.save()
                embed.setDescription(`
                <:983651050911313941:983651050911313941> | Punishment has successfully set to ${value}
                `)
                await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });


                break;
            default:

                break;

        }


    },
};