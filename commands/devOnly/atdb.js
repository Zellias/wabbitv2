const { SlashCommandBuilder } = require('@discordjs/builders');
const { inspect } = require('util');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('atdb')
    .setDescription('add guilds to the database'),
   execute(interaction) {
    console.log('d')
  },
};