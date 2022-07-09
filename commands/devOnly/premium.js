const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('node:timers/promises').setTimeout;
const { embed } = require('../../embed')
const { dev } = require(
    '../../config/config.json'
)
const Data = require('../../models/Data')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('premium')
        .setDescription('[Developers Only]')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('[Developers Only]')
                .addStringOption(option => option.setName('guildid').setDescription('Enter Guild ID').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('[Developers Only]')
                .addStringOption(option => option.setName('guildid').setDescription('Enter Guild ID').setRequired(true)))
    ,

    async execute(interaction) {
        embed.setTitle('Developers Area !')
        let guildID = interaction.options.getString('guildid');


        if (!dev.includes(interaction.user.id)) {
            return interaction.reply('You are not bot developer')
        }
        const result = await Data.findOne({ guildId: guildID });
        if (!result) {
            return await interaction.reply({ content: `${interaction.user} | Your Selected server is not in our database please add it first` });
        }
        let sub = interaction.options.getSubcommand()

        let resualt = await Data.findOneAndUpdate({ guildId: guildID })


        switch (sub) {
            case 'add':
                resualt.premium = true;
                resualt.save()
                embed.setDescription(`
              🥐 | ${guildID} Added to premium Guilds
            `)
                await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });
                break;
            case 'remove':
                resualt.premium = false;
                resualt.save()
                embed.setDescription(`
                🥐 | ${guildID} Removed From premium Guilds
              `)
                await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });
                break;
            default:
                break;
        }




    },
};