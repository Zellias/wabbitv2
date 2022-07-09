const { SlashCommandBuilder } = require('@discordjs/builders');
const { inspect } = require('util');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('evaluate a command')
    .addStringOption(option => option.setName('code').setDescription('Enter Code to Evaluate').setRequired(true)),
  async execute(interaction) {
    const { dev } = require(
      '../../config/config.json'
    )
    if (!dev.includes(interaction.user.id)) return;

    let evaled;
    try {
      evaled = await eval(interaction.options.getString('code'));
      await interaction.reply({ content: `${inspect(evaled)}`, ephemeral: true });
      console.log(inspect(evaled));
    }
    catch (error) {
      console.error(error);
      interaction.reply({ content: 'there was an error during evaluation.', ephemeral: true });
    }

  },
};