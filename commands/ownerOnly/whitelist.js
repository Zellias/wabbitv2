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
        .setName('whitelist')
        .setDescription('Set Limits of ban ')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('add user to whitelist')
                .addUserOption(option => option.setName('user').setDescription('Choose Member').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('remove a user from whitelist')
                .addUserOption(option => option.setName('user').setDescription('Choose Member').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('users')
                .setDescription('Show all guild whitelist users')

        ),
    async execute(interaction) {
        const { embed } = require('../../embed')
        embed.setTitle('Whitelist Action !')


        let owner = await interaction.guild.fetchOwner()
        if (interaction.user.id !== owner.id && !dev.includes(interaction.user.id)) {
            return interaction.reply('You are not ownership or bot developer')
        }
        let resualt = await Data.findOneAndUpdate({ guildId: interaction.guild.id })     
        if (!resualt) {
            await addGuildToDataBase(interaction.guild.id)
        } 
        let sub = interaction.options.getSubcommand()
      


        const user = interaction.options.getUser('user');

        let txy = ''
        switch (sub) {
            case 'add':
                if (resualt.whitelist.all.includes(user.id)) {
                    embed.setDescription(`
                        <:983635028867162112:983635028867162112> | ${user} was currently in ${interaction.guild.name} whitelist !
                        `)
                    return await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });
                }
                resualt.whitelist.all.push(user.id)
                await resualt.save()
                embed.setDescription(`
                <:983632799997231114:983632799997231114> | ${user} added to ${interaction.guild.name} whitelist !
                `)
                await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });
                break;
            case 'remove':
                resualt.whitelist.all.pull(user.id)
                await resualt.save()
                embed.setDescription(`
                <:983632801683370014:983632801683370014> | ${user} removed from ${interaction.guild.name} whitelist !
                `)
                await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });
                break;
            default:
                await resualt.whitelist.all.forEach(user => {
                    txy += `<@${user}>,`
                })
                embed.setDescription(`
               **Users In Whitelist**
               ${txy}
                `)
                await interaction.reply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true });
                break;
        }








    },
};