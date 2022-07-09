function register(){
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { bot } = require("./config/config.json")


const commands = [];
const commandFolders = fs.readdirSync('./commands')


for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}/`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		commands.push(command.data.toJSON());
		console.log(`+ Registered ${file} from ${folder}`)
	}
}
const rest = new REST({ version: '9' }).setToken(bot.token);

rest.put(Routes.applicationCommands(bot.clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
}
module.exports = {register}
