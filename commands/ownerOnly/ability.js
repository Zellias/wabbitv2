const { SlashCommandBuilder } = require('@discordjs/builders');
const { Z_ASCII } = require('node:zlib');
const { dev } = require(
    '../../config/config.json'
)
const { MessageActionRow, MessageButton } = require('discord.js');
const { addGuildToDataBase } = require('../../addGuild')
const Data = require('../../models/Data')
const wait = require('node:timers/promises').setTimeout;
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ability')
        .setDescription('Set Bot Ability Settings')
        .addStringOption(option =>
            option.setName('ability')
                .setDescription('Choose Ability Settings')
                .setRequired(true)
                .addChoices({
                    name: 'Channel Freeze',
                    value: 'cf'
                })
                .addChoices({
                    name: 'Anti Link',
                    value: 'al'
                })
                 .addChoices({
                     name: 'Anti Ghost Ping',
                     value: 'agp'
                 })
                .addChoices({
                    name: 'Anti Bot',
                    value: 'ab'
                })
                .addChoices({
                    name: 'Anti Role Dangerous Permission',
                    value: 'ardp'
                })
        ).setDescription('Change anti channel status [ON/OFF]')
        .addStringOption(option =>
            option.setName('mode')
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


    ,

    async execute(interaction) {
        const { embed } = require('../../embed')
        embed.setTitle('Ability Action !')


        let owner = await interaction.guild.fetchOwner()
        if (interaction.user.id !== owner.id && !dev.includes(interaction.user.id)) {
            return interaction.reply('You are not ownership or bot developer')
        }
        let resualt = await Data.findOneAndUpdate({ guildId: interaction.guild.id })
        if (!resualt) {
            await addGuildToDataBase(interaction.guild.id)
        } 
       
        let settings = resualt.ability
        let ability = interaction.options.get('ability').value
        let mode = interaction.options.get('mode').value

        switch (ability) {
            case 'cf':
                if (mode == 'on') {
                    settings.channel_freeze = true
                    resualt.save()
                    embed.setDescription(`
                <:983651050911313941:983651050911313941> | Channel Freeze Mode has successfully set to ${mode}
                    `)
                    await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });
                } else {
                    settings.channel_freeze = false
                    resualt.save()
                    embed.setDescription(`
                <:983651050911313941:983651050911313941> | Channel Freeze Mode has successfully set to ${mode}
                    `)
                    await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });


                }
                break;

            case 'al':
                if (mode == 'on') {
                    settings.anti_link = true
                    resualt.save()
                    embed.setDescription(`
                    <:983651050911313941:983651050911313941> | Anti Link Mode has successfully set to ${mode}
                        `)
                    await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });
                } else {
                    settings.anti_link = false
                    resualt.save()

                    embed.setDescription(`
                    <:983651050911313941:983651050911313941> | Anti Link Mode has successfully set to ${mode}
                        `)
                    await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });

                }
                break;

            case 'agp':
                const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('primary')
					.setLabel('Create Invite Link')
					.setStyle('PRIMARY'),
			);
                if(!resualt.premium) return interaction.reply({ content: `${interaction.user} You dont have premium membership join our support server via button below `, components: [row] ,ephemeral: true });
                if (mode == 'on') {
                    settings.anti_ghost_ping = true
                    resualt.save()
                    embed.setDescription(`
                    <:983651050911313941:983651050911313941> | Anti Ghost Ping Mode has successfully set to ${mode}
                        `)
                    await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });
                } else {
                    settings.anti_ghost_ping = false
                    resualt.save()
                    embed.setDescription(`
                    <:983651050911313941:983651050911313941> | Anti Ghost Ping Mode has successfully set to ${mode}
                        `)
                    await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });


                }
                break;

            case 'ab':
                if (mode == 'on') {
                    settings.anti_bot = true
                    resualt.save()
                    embed.setDescription(`
                    <:983651050911313941:983651050911313941> | Anti Bot Mode has successfully set to ${mode}
                        `)
                    await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });
                } else {
                    settings.anti_bot = false
                    resualt.save()
                    embed.setDescription(`
                    <:983651050911313941:983651050911313941> | Anti Bot Mode has successfully set to ${mode}
                        `)
                    await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });


                }
                break;

            case 'ardp':
                if (mode == 'on') {
                    settings.anti_dang_role_perm = true
                    resualt.save()
                    embed.setDescription(`
                        <:983651050911313941:983651050911313941> | Anti Role Dangerous Permission Mode has successfully set to ${mode}
                            `)
                    await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });
                } else {
                    settings.anti_dang_role_perm = false
                    resualt.save()
                    embed.setDescription(`
                        <:983651050911313941:983651050911313941> | Anti Role Dangerous Permission Mode has successfully set to ${mode}
                            `)
                    await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });


                }

                break;
            default:

                break;


        }


    },
};