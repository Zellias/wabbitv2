const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageEmbed} = require('discord.js')
const wait = require('node:timers/promises').setTimeout;
const {embed} = require('../../embed')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('See all bot commands'),

    async execute(interaction) {
        embed.setTitle('Read Document below for any help!')
        embed.setDescription('[Read Documents.](https://wabbit.gitbook.io/documents/)\n> https://wabbit.gitbook.io/documents/')
        await interaction.reply({content:`${interaction.user}`,embeds:[embed]});

    },
};