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
        .setName('limit-role')
        .setDescription('Set Limits of role [ Create / Update / Delete ]')

        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Set Limits of role creations')
                .addIntegerOption(option => option.setName('limit').setDescription('Enter Limit Number').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Set Limits of role Delete')
                .addIntegerOption(option => option.setName('limit').setDescription('Enter Limit Number').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('update')
                .setDescription('Set Limits of role update')
                .addIntegerOption(option => option.setName('limit').setDescription('Enter Limit Number').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Change anti role status [ON/OFF]')
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

        let sub = interaction.options.getSubcommand()
        let resualt = await Data.findOneAndUpdate({ guildId: interaction.guild.id })
        if (!resualt) {
            await addGuildToDataBase(interaction.guild.id)
        }
        switch (sub) {
            case 'create':
                const channeCreate = interaction.options.getInteger('limit');

                resualt.limit.role.create = channeCreate
                await resualt.save()

                embed.setDescription(`
                <:983651050911313941:983651050911313941> | role Create Limit has sucsessfully set to ${channeCreate}
            `)
                await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });



                break;
            case 'delete':
                const channeDelete = interaction.options.getInteger('limit');


                resualt.limit.role.delete = channeDelete
                await resualt.save()
                embed.setDescription(`
                <:983651050911313941:983651050911313941> | role Delete Limit has sucsessfully set to ${channeDelete}
                `)
                await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });





                break;
            case 'update':
                const channeUpdate = interaction.options.getInteger('limit');

                console.log(channeUpdate)

                resualt.limit.role.update = channeUpdate
                await resualt.save()



                embed.setDescription(`
                <:983651050911313941:983651050911313941> | role Update Limit has successfully set to ${channeUpdate}
                `)
                await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });

                break;


            default:

                var value = interaction.options.get('value').value
                console.log(value)
                if (value === 'on') {
                    resualt.limit.role.isEnable = true
                    await resualt.save()
                    embed.setDescription(`
                    <:983651050911313941:983651050911313941> | Anti role Status has successfully set to ${value}
                    `)
                    await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });
                } else if (value === 'off') {
                    resualt.limit.role.isEnable = false
                    await resualt.save()
                    embed.setDescription(`
                    <:983651050911313941:983651050911313941> | Anti role Status has successfully set to ${value}
                    `)
                    await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });
                }

                break;
        }

    },
};