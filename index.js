const { Client, Intents, Interaction, Collection, MessageEmbed, WebhookClient,MessageActionRow, MessageButton } = require('discord.js');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs')
var clc = require("cli-color");

//================================================
const { addGuildToDataBase } = require('./addGuild')
const db = require('quick.db')
//================================================

const client = new Client({ intents: new Intents(32767), partials: ["GUILD_MEMBER"] });
client.commands = new Collection();
//================================================

const { bot, database } = require('./config/config.json')

mongoose.Promise = global.Promise;
mongoose.connect(database.url).then((connected) => { console.log(clc.green("- Database connected.")); console.log(clc.redBright("========================")) }).catch((err) => { console.log("cant connect to the database"); });

const Data = require("./models/Data");
const { register } = require('./plugin')
register()
//================================================
process.on('unhandledRejection', error => {
    return
});

//.filter(file => file.endsWith('.js'));

const commandFolders = fs.readdirSync('./commands')
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}/`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);

        client.commands.set(command.data.name, command);
        console.log(`Loaded ${file} from ${folder}`)
    }
}




const logPath = path.join(__dirname, 'logs');
const eventFiles = fs.readdirSync(logPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(logPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}




client.on('ready', () => {
    client.user.setPresence({ activities: [{ name: 'Watching Users Action ⚠️' }] });
    console.log(clc.green(`- Bot is online`))

})

client.on('guildCreate', async guild => {

    const result = await Data.findOne({ guildId: guild.id });
    if (!result) {
        await addGuildToDataBase(guild.id)
    }
    const webhook = new WebhookClient({ url: `https://discord.com/api/webhooks/984785958270558258/PAlP4JEu_ZNH-5_v01eFhJz4xBA8Q6lrAEbRaFIieq22SOdDWlUB0ElYqrwtzkjLlro8` })
    let owner = await guild.fetchOwner()
    const embed = new MessageEmbed()
        .setAuthor(guild.name, guild.iconURL({ dynamic: true }))
        .setTitle(`<:983651050911313941:983651050911313941> New Server !`)
        .setDescription(`
Guild Owner : ${owner.user.tag}
Members : ${guild.memberCount}
    `)
        .setColor('#4285F4')
    webhook.send({ embeds: [embed] })


})

client.on('guildDelete', async guild => {
    if (guild.memberCount < 30) {
        guild.leave()
    }

    const webhook = new WebhookClient({ url: `https://discord.com/api/webhooks/984785958270558258/PAlP4JEu_ZNH-5_v01eFhJz4xBA8Q6lrAEbRaFIieq22SOdDWlUB0ElYqrwtzkjLlro8` })
    let owner = await guild.fetchOwner()
    const embed = new MessageEmbed()
        .setAuthor(guild.name, guild.iconURL({ dynamic: true }))
        .setTitle(`<:983651050911313941:983651050911313941> Bot Left from a Server !`)
        .setDescription(`
Guild Owner : ${owner.user.tag}
Members : ${guild.memberCount}
    `)
        .setColor('#4285F4')
    webhook.send({ embeds: [embed] })


})


client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (!interaction.guild) return interaction.reply({ content: 'use commands in dms' });
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});




client.on("channelCreate", async function (channel) {
    const result = await Data.findOne({ guildId: channel.guild.id });
    if (!result) return;
    if (!result.limit.channel.isEnable) return;
    const limit = result.limit.channel.create
    if (!limit) return;
    const punish = result.punishment
    if (limit === 0) return;
    if (limit === null) return;
    if (!channel.guild) return;

    const fetchedLogs = await channel.guild.fetchAuditLogs({
        limit: 1,
        type: 'CHANNEL_CREATE',
    });

    const deletionLog = fetchedLogs.entries.first();
    if (!deletionLog) return console.log(`Not Found`);

    const { executor } = deletionLog;
if(!executor ) return;
    if (result.whitelist.all.includes(executor.id)) return;
    if (client.user.id === executor.id) return;

    if (executor.id === (await channel.guild.fetchOwner()).user.id) return;
    db.add(`${executor.id}_${channel.guild.id}_channelCreateLimit`, 1)
    let userLimit = db.get(`${executor.id}_${channel.guild.id}_channelCreateLimit`)


    if (userLimit == limit) {

        switch (punish) {
            case 'removerole':
                channel.guild.roles.cache.forEach(async role => {
                    if (role.members.get(executor.id)) {
                        console.log(`+ ${role.name}`)
                        if (role.id !== channel.guild.id) {
                            const guild = client.guilds.cache.get(channel.guild.id);
                            const roled = channel.guild.roles.cache.get(role.id);
                            const member = await guild.members.fetch(executor.id);

                            console.log(executor.id)
                            member.roles.remove(roled).then(async eu => {
                                const owner = client.users.cache.get((await channel.guild.fetchOwner()).user.id)
                                const embed = new MessageEmbed()
                                    .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                                    .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                                    .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                                    .setDescription(`
                                    **Hello ${channel.guild.name} Owner <a:crown:939352514455797881> ,**
                                    ${executor.tag} Was Created ${limit} Channel's And i punished Him !
                                    `)
                                    .setColor('#00ebff')
                                owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })


                            }).catch(async err => {
                                const embed = new MessageEmbed()
                                    .setColor('ffff00')
                                    .setDescription(`
                                **Hello ${channel.guild.name} Owner <a:crown:939352514455797881> ,**
                                ${executor.tag} Was Created ${limit} Channel's ,and I don't have permissions and I can't punish  ${executor.tag}
                                `)
                                    .setTitle('Alert  <:Alert:939351669341323264> ')
                                    .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                                    .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                                const owner = client.users.cache.get((await channel.guild.fetchOwner()).user.id)
                                owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })

                            })
                        } else {
                            return;
                        }
                    } else {
                        return;
                    }
                })

                db.set(`${executor.id}_${channel.guild.id}_channelCreateLimit`, 0)
                break;
            case 'ban':
                console.log('1')
                channel.guild.members.ban(executor.id).then().catch(err => { })
                await channel.guild.bans.fetch(executor).then(async un => {
                    const owner = client.users.cache.get((await channel.guild.fetchOwner()).user.id)
                    const embed = new MessageEmbed()
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                        .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                        .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                        .setDescription(`
                        **Hello ${channel.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Created ${limit} Channel's And i punished Him !
                        `)
                        .setColor('#00ebff')
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })
                }).catch(async err => {
                    const embed = new MessageEmbed()
                        .setColor('ffff00')
                        .setDescription(`
                        **Hello ${channel.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Created ${limit} Channel's ,and I don't have permissions and I can't punish  ${executor.tag}
                        `)
                        .setTitle('Alert  <:Alert:939351669341323264> ')
                        .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                    const owner = client.users.cache.get((await channel.guild.fetchOwner()).user.id)
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })
                });
                db.set(`${executor.id}_${channel.guild.id}_channelCreateLimit`, 0)
                break;
            case 'kick':
                console.log('1')
                channel.guild.members.kick(executor.id).then(async eu => {
                    const owner = client.users.cache.get((await channel.guild.fetchOwner()).user.id)
                    const embed = new MessageEmbed()
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                        .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                        .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                        .setDescription(`
                        **Hello ${channel.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Created ${limit} Channel's And i punished Him !
                        `)
                        .setColor('#00ebff')
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })


                }).catch(async err => {
                    const embed = new MessageEmbed()
                        .setColor('ffff00')
                        .setDescription(`
                    **Hello ${channel.guild.name} Owner <a:crown:939352514455797881> ,**
                    ${executor.tag} Was Created ${limit} Channel's ,and I don't have permissions and I can't punish  ${executor.tag}
                    `)
                        .setTitle('Alert  <:Alert:939351669341323264> ')
                        .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                    const owner = client.users.cache.get((await channel.guild.fetchOwner()).user.id)
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })

                })
                db.set(`${executor.id}_${channel.guild.id}_channelCreateLimit`, 0)
                break;
            default:
                break;
        }



    }



})



client.on("channelDelete", async function (channel) {
    const result = await Data.findOne({ guildId: channel.guild.id });
    if (!result) return;
    if (!result.limit.channel.isEnable) return;
    const limit = result.limit.channel.delete
    if (!limit) return;
    const punish = result.punishment
    if (limit === 0) return;
    if (limit === null) return;
    if (!channel.guild) return;
    console.log('d')
    const fetchedLogs = await channel.guild.fetchAuditLogs({
        limit: 1,
        type: 'CHANNEL_DELETE',
    });

    const deletionLog = fetchedLogs.entries.first();
    if (!deletionLog) return console.log(`Not Found`);

    const { executor } = deletionLog;
if(!executor ) return;
    if (result.whitelist.all.includes(executor.id)) return;
    if (client.user.id === executor.id) return;

    if (executor.id === (await channel.guild.fetchOwner()).user.id) return;
    db.add(`${executor.id}_${channel.guild.id}_channelDeleteLimit`, 1)
    let userLimit = db.get(`${executor.id}_${channel.guild.id}_channelDeleteLimit`)

    console.log(userLimit)
    if (userLimit == limit) {

        switch (punish) {
            case 'removerole':
                channel.guild.roles.cache.forEach(async role => {
                    if (role.members.get(executor.id)) {
                        console.log(`+ ${role.name}`)
                        if (role.id !== channel.guild.id) {
                            const guild = client.guilds.cache.get(channel.guild.id);
                            const roled = channel.guild.roles.cache.get(role.id);
                            const member = await guild.members.fetch(executor.id);

                            console.log(executor.id)
                            member.roles.remove(roled).then(async eu => {
                                const owner = client.users.cache.get((await channel.guild.fetchOwner()).user.id)
                                const embed = new MessageEmbed()
                                    .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                                    .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                                    .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                                    .setDescription(`
                                    **Hello ${channel.guild.name} Owner <a:crown:939352514455797881> ,**
                                    ${executor.tag} Was Deleted ${limit} Channel's And i punished Him !
                                    `)
                                    .setColor('#00ebff')
                                owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })


                            }).catch(async err => {
                                const embed = new MessageEmbed()
                                    .setColor('ffff00')
                                    .setDescription(`
                                **Hello ${channel.guild.name} Owner <a:crown:939352514455797881> ,**
                                ${executor.tag} Was Deleted ${limit} Channel's ,and I don't have permissions and I can't punish  ${executor.tag}
                                `)
                                    .setTitle('Alert  <:Alert:939351669341323264> ')
                                    .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                                    .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                                const owner = client.users.cache.get((await channel.guild.fetchOwner()).user.id)
                                owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })

                            })
                        } else {
                            return;
                        }
                    } else {
                        return;
                    }
                })

                db.set(`${executor.id}_${channel.guild.id}_channelDeleteLimit`, 0)
                break;
            case 'ban':
                console.log('1')
                channel.guild.members.ban(executor.id).then().catch(err => { })
                await channel.guild.bans.fetch(executor).then(async un => {
                    const owner = client.users.cache.get((await channel.guild.fetchOwner()).user.id)
                    const embed = new MessageEmbed()
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                        .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                        .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                        .setDescription(`
                        **Hello ${channel.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Created ${limit} Channel's And i punished Him !
                        `)
                        .setColor('#00ebff')
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })
                }).catch(async err => {
                    const embed = new MessageEmbed()
                        .setColor('ffff00')
                        .setDescription(`
                        **Hello ${channel.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Deleted ${limit} Channel's ,and I don't have permissions and I can't punish  ${executor.tag}
                        `)
                        .setTitle('Alert  <:Alert:939351669341323264> ')
                        .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                    const owner = client.users.cache.get((await channel.guild.fetchOwner()).user.id)
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })
                });
                db.set(`${executor.id}_${channel.guild.id}_channelDeleteLimit`, 0)
                break;
            case 'kick':
                console.log('1')
                channel.guild.members.kick(executor.id).then(async eu => {
                    const owner = client.users.cache.get((await channel.guild.fetchOwner()).user.id)
                    const embed = new MessageEmbed()
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                        .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                        .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                        .setDescription(`
                        **Hello ${channel.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Deleted ${limit} Channel's And i punished Him !
                        `)
                        .setColor('#00ebff')
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })


                }).catch(async err => {
                    const embed = new MessageEmbed()
                        .setColor('ffff00')
                        .setDescription(`
                    **Hello ${channel.guild.name} Owner <a:crown:939352514455797881> ,**
                    ${executor.tag} Was Deleted ${limit} Channel's ,and I don't have permissions and I can't punish  ${executor.tag}
                    `)
                        .setTitle('Alert  <:Alert:939351669341323264> ')
                        .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                    const owner = client.users.cache.get((await channel.guild.fetchOwner()).user.id)
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })

                })
                db.set(`${executor.id}_${channel.guild.id}_channelDeleteLimit`, 0)
                break;
            default:
                break;
        }



    }



})



client.on("roleDelete", async function (role) {
    const result = await Data.findOne({ guildId: role.guild.id });
    if (!result) return;
    if (!result.limit.role.isEnable) return;
    const limit = result.limit.role.delete
    if (!limit) return;
    const punish = result.punishment
    if (limit === 0) return;
    if (limit === null) return;
    if (!role.guild) return;

    const fetchedLogs = await role.guild.fetchAuditLogs({
        limit: 1,
        type: 'ROLE_DELETE',
    });


    const deletionLog = fetchedLogs.entries.first();
    if (!deletionLog) return console.log(`Not Found`);

    const { executor } = deletionLog;
if(!executor ) return;
    if (result.whitelist.all.includes(executor.id)) return;
    if (client.user.id === executor.id) return;

    if (executor.id === (await role.guild.fetchOwner()).user.id) return;
    db.add(`${executor.id}_${role.guild.id}_roleDeleteLimit`, 1)
    let userLimit = db.get(`${executor.id}_${role.guild.id}_roleDeleteLimit`)

    console.log(userLimit)
    if (userLimit == limit) {

        switch (punish) {
            case 'removerole':
                role.guild.roles.cache.forEach(async role => {
                    if (role.members.get(executor.id)) {
                        console.log(`+ ${role.name}`)
                        if (role.id !== role.guild.id) {
                            const guild = client.guilds.cache.get(role.guild.id);
                            const roled = role.guild.roles.cache.get(role.id);
                            const member = await guild.members.fetch(executor.id);

                            console.log(executor.id)
                            member.roles.remove(roled).then(async eu => {
                                const owner = client.users.cache.get((await role.guild.fetchOwner()).user.id)
                                const embed = new MessageEmbed()
                                    .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                                    .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                                    .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                                    .setDescription(`
                                    **Hello ${role.guild.name} Owner <a:crown:939352514455797881> ,**
                                    ${executor.tag} Was Deleted ${limit} Role's And i punished Him !
                                    `)
                                    .setColor('#00ebff')
                                owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })


                            }).catch(async err => {
                                const embed = new MessageEmbed()
                                    .setColor('ffff00')
                                    .setDescription(`
                                **Hello ${role.guild.name} Owner <a:crown:939352514455797881> ,**
                                ${executor.tag} Was Deleted ${limit} Role's ,and I don't have permissions and I can't punish  ${executor.tag}
                                `)
                                    .setTitle('Alert  <:Alert:939351669341323264> ')
                                    .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                                    .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                                const owner = client.users.cache.get((await role.guild.fetchOwner()).user.id)
                                owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })

                            })
                        } else {
                            return;
                        }
                    } else {
                        return;
                    }
                })

                db.set(`${executor.id}_${role.guild.id}_roleDeleteLimit`, 0)
                break;
            case 'ban':
                console.log('1')
                role.guild.members.ban(executor.id).then().catch(err => { })
                await role.guild.bans.fetch(executor).then(async un => {
                    const owner = client.users.cache.get((await role.guild.fetchOwner()).user.id)
                    const embed = new MessageEmbed()
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                        .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                        .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                        .setDescription(`
                        **Hello ${role.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Created ${limit} Role's And i punished Him !
                        `)
                        .setColor('#00ebff')
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })
                }).catch(async err => {
                    const embed = new MessageEmbed()
                        .setColor('ffff00')
                        .setDescription(`
                        **Hello ${role.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Deleted ${limit} Role's ,and I don't have permissions and I can't punish  ${executor.tag}
                        `)
                        .setTitle('Alert  <:Alert:939351669341323264> ')
                        .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                    const owner = client.users.cache.get((await role.guild.fetchOwner()).user.id)
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })
                });
                db.set(`${executor.id}_${role.guild.id}_roleDeleteLimit`, 0)
                break;
            case 'kick':
                console.log('1')
                role.guild.members.kick(executor.id).then(async eu => {
                    const owner = client.users.cache.get((await role.guild.fetchOwner()).user.id)
                    const embed = new MessageEmbed()
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                        .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                        .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                        .setDescription(`
                        **Hello ${role.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Deleted ${limit} Role's And i punished Him !
                        `)
                        .setColor('#00ebff')
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })


                }).catch(async err => {
                    const embed = new MessageEmbed()
                        .setColor('ffff00')
                        .setDescription(`
                    **Hello ${role.guild.name} Owner <a:crown:939352514455797881> ,**
                    ${executor.tag} Was Deleted ${limit} Role's ,and I don't have permissions and I can't punish  ${executor.tag}
                    `)
                        .setTitle('Alert  <:Alert:939351669341323264> ')
                        .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                    const owner = client.users.cache.get((await role.guild.fetchOwner()).user.id)
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })

                })
                db.set(`${executor.id}_${role.guild.id}_roleDeleteLimit`, 0)
                break;
            default:
                break;
        }
    }



})



client.on("roleCreate", async function (role) {
    const result = await Data.findOne({ guildId: role.guild.id });
    if (!result) return;
    if (!result.limit.role.isEnable) return;
    const limit = result.limit.role.create
    if (!limit) return;
    const punish = result.punishment
    if (limit === 0) return;
    if (limit === null) return;
    if (!role.guild) return;

    const fetchedLogs = await role.guild.fetchAuditLogs({
        limit: 1,
        type: 'ROLE_CREATE',
    });


    const deletionLog = fetchedLogs.entries.first();
    if (!deletionLog) return console.log(`Not Found`);

    const { executor } = deletionLog;
if(!executor ) return;
    if (result.whitelist.all.includes(executor.id)) return;
    if (client.user.id === executor.id) return;

    if (executor.id === (await role.guild.fetchOwner()).user.id) return;
    db.add(`${executor.id}_${role.guild.id}_roleCreateLimit`, 1)
    let userLimit = db.get(`${executor.id}_${role.guild.id}_roleCreateLimit`)

    console.log(userLimit)

    if (userLimit == limit) {

        switch (punish) {
            case 'removerole':
                role.guild.roles.cache.forEach(async role => {
                    if (role.members.get(executor.id)) {
                        console.log(`+ ${role.name}`)
                        if (role.id !== role.guild.id) {
                            const guild = client.guilds.cache.get(role.guild.id);
                            const roled = role.guild.roles.cache.get(role.id);
                            const member = await guild.members.fetch(executor.id);

                            console.log(executor.id)
                            member.roles.remove(roled).then(async eu => {
                                const owner = client.users.cache.get((await role.guild.fetchOwner()).user.id)
                                const embed = new MessageEmbed()
                                    .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                                    .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                                    .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                                    .setDescription(`
                                    **Hello ${role.guild.name} Owner <a:crown:939352514455797881> ,**
                                    ${executor.tag} Was Created ${limit} Role's And i punished Him !
                                    `)
                                    .setColor('#00ebff')
                                owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })


                            }).catch(async err => {
                                const embed = new MessageEmbed()
                                    .setColor('ffff00')
                                    .setDescription(`
                                **Hello ${role.guild.name} Owner <a:crown:939352514455797881> ,**
                                ${executor.tag} Was Created ${limit} Role's ,and I don't have permissions and I can't punish  ${executor.tag}
                                `)
                                    .setTitle('Alert  <:Alert:939351669341323264> ')
                                    .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                                    .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                                const owner = client.users.cache.get((await role.guild.fetchOwner()).user.id)
                                owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })

                            })
                        } else {
                            return;
                        }
                    } else {
                        return;
                    }
                })

                db.set(`${executor.id}_${role.guild.id}_roleCreateLimit`, 0)
                break;
            case 'ban':
                console.log('1')
                role.guild.members.ban(executor.id).then().catch(err => { })
                await role.guild.bans.fetch(executor).then(async un => {
                    const owner = client.users.cache.get((await role.guild.fetchOwner()).user.id)
                    const embed = new MessageEmbed()
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                        .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                        .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                        .setDescription(`
                        **Hello ${role.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Created ${limit} Role's And i punished Him !
                        `)
                        .setColor('#00ebff')
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })
                }).catch(async err => {
                    const embed = new MessageEmbed()
                        .setColor('ffff00')
                        .setDescription(`
                        **Hello ${role.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Created ${limit} Role's ,and I don't have permissions and I can't punish  ${executor.tag}
                        `)
                        .setTitle('Alert  <:Alert:939351669341323264> ')
                        .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                    const owner = client.users.cache.get((await role.guild.fetchOwner()).user.id)
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })
                });
                db.set(`${executor.id}_${role.guild.id}_roleCreateLimit`, 0)
                break;
            case 'kick':
                console.log('1')
                role.guild.members.kick(executor.id).then(async eu => {
                    const owner = client.users.cache.get((await role.guild.fetchOwner()).user.id)
                    const embed = new MessageEmbed()
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                        .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                        .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                        .setDescription(`
                        **Hello ${role.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Created ${limit} Role's And i punished Him !
                        `)
                        .setColor('#00ebff')
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })


                }).catch(async err => {
                    const embed = new MessageEmbed()
                        .setColor('ffff00')
                        .setDescription(`
                    **Hello ${role.guild.name} Owner <a:crown:939352514455797881> ,**
                    ${executor.tag} Was Created ${limit} Role's ,and I don't have permissions and I can't punish  ${executor.tag}
                    `)
                        .setTitle('Alert  <:Alert:939351669341323264> ')
                        .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                    const owner = client.users.cache.get((await role.guild.fetchOwner()).user.id)
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })

                })
                db.set(`${executor.id}_${role.guild.id}_roleCreateLimit`, 0)
                break;
            default:
                break;
        }



    }


})



client.on('guildMemberRemove', async member => {
    const result = await Data.findOne({ guildId: member.guild.id });
    if (!result) return;
    if (!result.limit.kick.isEnable) return;
    const limit = result.limit.kick.add
    if (!limit) return;
    const punish = result.punishment
    if (limit === 0) return;
    if (limit === null) return;
    if (!member.guild) return;

    const fetchedLogs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: 'MEMBER_KICK',
    });


    const deletionLog = fetchedLogs.entries.first();
    if (!deletionLog) return console.log(`Not Found`);

    const { executor } = deletionLog;
if(!executor ) return;
    if (result.whitelist.all.includes(executor.id)) return;
    if (client.user.id === executor.id) return;

    if (executor.id === (await member.guild.fetchOwner()).user.id) return;
    db.add(`${executor.id}_${member.guild.id}_kickLimit`, 1)
    let userLimit = db.get(`${executor.id}_${member.guild.id}_kickLimit`)

    console.log(userLimit)


    if (userLimit == limit) {

        switch (punish) {
            case 'removerole':
                member.guild.roles.cache.forEach(async role => {
                    if (role.members.get(executor.id)) {
                        console.log(`+ ${role.name}`)
                        if (role.id !== role.guild.id) {
                            const guild = client.guilds.cache.get(role.guild.id);
                            const roled = role.guild.roles.cache.get(role.id);
                            const member = await guild.members.fetch(executor.id);

                            console.log(executor.id)
                            member.roles.remove(roled).then(async eu => {
                                const owner = client.users.cache.get((await role.guild.fetchOwner()).user.id)
                                const embed = new MessageEmbed()
                                    .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                                    .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                                    .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                                    .setDescription(`
                                    **Hello ${role.guild.name} Owner <a:crown:939352514455797881> ,**
                                    ${executor.tag} Was Created ${limit} Kick's And i punished Him !
                                    `)
                                    .setColor('#00ebff')
                                owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })


                            }).catch(async err => {
                                const embed = new MessageEmbed()
                                    .setColor('ffff00')
                                    .setDescription(`
                                **Hello ${role.guild.name} Owner <a:crown:939352514455797881> ,**
                                ${executor.tag} Was Created ${limit} Kick's ,and I don't have permissions and I can't punish  ${executor.tag}
                                `)
                                    .setTitle('Alert  <:Alert:939351669341323264> ')
                                    .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                                    .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                                const owner = client.users.cache.get((await role.guild.fetchOwner()).user.id)
                                owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })
                            })
                        } else {
                            return;
                        }
                    } else {
                        return;
                    }
                })

                db.set(`${executor.id}_${member.guild.id}_kickLimit`, 0)
                break;
            case 'ban':
                member.guild.members.ban(executor.id).then().catch(err => { })
                await member.guild.bans.fetch(executor).then(async un => {
                    const owner = client.users.cache.get((await member.guild.fetchOwner()).user.id)
                    const embed = new MessageEmbed()
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                        .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                        .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                        .setDescription(`
                        **Hello ${member.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Kicked ${limit} User And i punished Him !
                        `)
                        .setColor('#00ebff')
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })
                }).catch(async err => {
                    const embed = new MessageEmbed()
                        .setColor('ffff00')
                        .setDescription(`
                        **Hello ${member.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Kicked ${limit} User ,and I don't have permissions and I can't punish  ${executor.tag}
                        `)
                        .setTitle('Alert  <:Alert:939351669341323264> ')
                        .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                    const owner = client.users.cache.get((await member.guild.fetchOwner()).user.id)
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })
                });
                db.set(`${executor.id}_${member.guild.id}_kickLimit`, 0)
                break;
            case 'kick':
                console.log('1')
                member.guild.members.kick(executor.id).then(async eu => {
                    const owner = client.users.cache.get((await member.guild.fetchOwner()).user.id)
                    const embed = new MessageEmbed()
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                        .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                        .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                        .setDescription(`
                        **Hello ${member.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Kicked ${limit} User And i punished Him !
                        `)
                        .setColor('#00ebff')
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })


                }).catch(async err => {
                    const embed = new MessageEmbed()
                        .setColor('ffff00')
                        .setDescription(`
                    **Hello ${member.guild.name} Owner <a:crown:939352514455797881> ,**
                    ${executor.tag} Was Kicked ${limit} User ,and I don't have permissions and I can't punish  ${executor.tag}
                    `)
                        .setTitle('Alert  <:Alert:939351669341323264> ')
                        .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                    const owner = client.users.cache.get((await member.guild.fetchOwner()).user.id)
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })

                })
                db.set(`${executor.id}_${member.guild.id}_kickLimit`, 0)
                break;
            default:
                break;
        }



    }


})


client.on('guildBanAdd', async ban => {
    const result = await Data.findOne({ guildId: ban.guild.id });
    if (!result) return;
    if (!result.limit.ban.isEnable) return;
    const limit = result.limit.ban.add
    if (!limit) return;
    const punish = result.punishment
    if (limit === 0) return;
    if (limit === null) return;
    if (!ban.guild) return;


    const fetchedLogs = await ban.guild.fetchAuditLogs({
        limit: 1,
        type: 'MEMBER_BAN_ADD',
    });



    const deletionLog = fetchedLogs.entries.first();
    if (!deletionLog) return console.log(`Not Found`);

    const { executor } = deletionLog;
if(!executor ) return;
    if (result.whitelist.all.includes(executor.id)) return;
    if (client.user.id === executor.id) return;

    if (executor.id === (await ban.guild.fetchOwner()).user.id) return;
    db.add(`${executor.id}_${ban.guild.id}_banAddLimit`, 1)
    let userLimit = db.get(`${executor.id}_${ban.guild.id}_banAddLimit`)

    console.log(userLimit)



    if (userLimit == limit) {

        switch (punish) {
            case 'removerole':
                ban.guild.roles.cache.forEach(async role => {
                    if (role.members.get(executor.id)) {
                        console.log(`+ ${role.name}`)
                        if (role.id !== ban.guild.id) {
                            const guild = client.guilds.cache.get(ban.guild.id);
                            const roled = ban.guild.roles.cache.get(role.id);
                            const member = await guild.members.fetch(executor.id);

                            console.log(executor.id)
                            member.roles.remove(roled).then(async eu => {
                                const owner = client.users.cache.get((await ban.guild.fetchOwner()).user.id)
                                const embed = new MessageEmbed()
                                    .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                                    .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                                    .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                                    .setDescription(`
                                    **Hello ${ban.guild.name} Owner <a:crown:939352514455797881> ,**
                                    ${executor.tag} Was Banned ${limit} User And i punished Him !
                                    `)
                                    .setColor('#00ebff')
                                owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })


                            }).catch(async err => {
                                const embed = new MessageEmbed()
                                    .setColor('ffff00')
                                    .setDescription(`
                                **Hello ${ban.guild.name} Owner <a:crown:939352514455797881> ,**
                                ${executor.tag} Was Banned ${limit} User ,and I don't have permissions and I can't punish  ${executor.tag}
                                `)
                                    .setTitle('Alert  <:Alert:939351669341323264> ')
                                    .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                                    .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                                const owner = client.users.cache.get((await ban.guild.fetchOwner()).user.id)
                                owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })

                            })
                        } else {
                            return;
                        }
                    } else {
                        return;
                    }
                })

                db.set(`${executor.id}_${ban.guild.id}_banAddLimit`, 0)
                break;
            case 'ban':
                ban.guild.members.ban(executor.id).then().catch(err => { })
                await ban.guild.bans.fetch(executor).then(async un => {
                    const owner = client.users.cache.get((await ban.guild.fetchOwner()).user.id)
                    const embed = new MessageEmbed()
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                        .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                        .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                        .setDescription(`
                        **Hello ${ban.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Banned ${limit} User And i punished Him !
                        `)
                        .setColor('#00ebff')
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })
                }).catch(async err => {
                    const embed = new MessageEmbed()
                        .setColor('ffff00')
                        .setDescription(`
                        **Hello ${ban.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Banned ${limit} User ,and I don't have permissions and I can't punish  ${executor.tag}
                        `)
                        .setTitle('Alert  <:Alert:939351669341323264> ')
                        .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                    const owner = client.users.cache.get((await ban.guild.fetchOwner()).user.id)
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })
                })
                db.set(`${executor.id}_${member.guild.id}_banAddLimit`, 0)
                break;
            case 'kick':
                ban.guild.members.kick(executor.id).then(async eu => {
                    const owner = client.users.cache.get((await ban.guild.fetchOwner()).user.id)
                    const embed = new MessageEmbed()
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                        .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                        .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                        .setDescription(`
                        **Hello ${ban.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Banned ${limit} User And i punished Him !
                        `)
                        .setColor('#00ebff')
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })


                }).catch(async err => {
                    const embed = new MessageEmbed()
                        .setColor('ffff00')
                        .setDescription(`
                    **Hello ${ban.guild.name} Owner <a:crown:939352514455797881> ,**
                    ${executor.tag} Was Banned ${limit} User ,and I don't have permissions and I can't punish  ${executor.tag}
                    `)
                        .setTitle('Alert  <:Alert:939351669341323264> ')
                        .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                    const owner = client.users.cache.get((await ban.guild.fetchOwner()).user.id)
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })

                })
                db.set(`${executor.id}_${ban.guild.id}_banAddLimit`, 0)
                break;
            default:
                break;
        }



    }
})



client.on('guildMemberAdd', async function (member) {
    const result = await Data.findOne({ guildId: member.guild.id });
    if (!result) return;
    if (!result.ability.anti_bot) return;
    const punish = result.punishment


    if (!member.guild) return;

    if (member.user.bot) {
        if (!member.guild) return;

        const fetchedLogs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: 'BOT_ADD',
        });

        const deletionLog = fetchedLogs.entries.first();
        if (!deletionLog) return console.log(`Not Found`);

        const { executor } = deletionLog;
if(!executor ) return;
        if (result.whitelist.all.includes(executor.id)) return;
        if (executor.id === (await member.guild.fetchOwner()).user.id) return;
        console.log(executor.username)

        member.guild.members.kick(member.user.id).then(member => { }).catch(err => { console.log(err) });
        switch (punish) {
            case 'removerole':
                member.guild.roles.cache.forEach(async role => {
                    if (role.members.get(executor.id)) {
                        console.log(`+ ${role.name}`)
                        if (role.id !== member.guild.id) {
                            const guild = client.guilds.cache.get(role.guild.id);
                            const roled = role.guild.roles.cache.get(role.id);
                            const member = await guild.members.fetch(executor.id);

                            console.log(executor.id)
                            member.roles.remove(roled).then(async eu => {
                                const owner = client.users.cache.get((await member.guild.fetchOwner()).user.id)
                                const embed = new MessageEmbed()
                                    .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                                    .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                                    .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                                    .setDescription(`
                                    **Hello ${member.guild.name} Owner <a:crown:939352514455797881> ,**
                                    ${executor.tag} Was Added Bot And i punished Him !
                                    `)
                                    .setColor('#00ebff')
                                owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })


                            }).catch(async err => {
                                const embed = new MessageEmbed()
                                    .setColor('ffff00')
                                    .setDescription(`
                                **Hello ${member.guild.name} Owner <a:crown:939352514455797881> ,**
                                ${executor.tag} Was Added Bot And i punished Him ,and I don't have permissions and I can't punish  ${executor.tag}
                                `)
                                    .setTitle('Alert  <:Alert:939351669341323264> ')
                                    .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                                    .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                                const owner = client.users.cache.get((await member.guild.fetchOwner()).user.id)
                                owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })

                            })
                        } else {
                            return;
                        }
                    } else {
                        return;
                    }
                })
                break;
            case 'kick':
                member.guild.members.kick(executor.id).then(async eu => {
                    const owner = client.users.cache.get((await member.guild.fetchOwner()).user.id)
                    const embed = new MessageEmbed()
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                        .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                        .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                        .setDescription(`
                        **Hello ${member.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Added Bot And i punished Him !
                        `)
                        .setColor('#00ebff')
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })


                }).catch(async err => {
                    const embed = new MessageEmbed()
                        .setColor('ffff00')
                        .setDescription(`
                    **Hello ${member.guild.name} Owner <a:crown:939352514455797881> ,**
                    ${executor.tag} Was Added Bot ,and I don't have permissions and I can't punish  ${executor.tag}
                    `)
                        .setTitle('Alert  <:Alert:939351669341323264> ')
                        .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                    const owner = client.users.cache.get((await member.guild.fetchOwner()).user.id)
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })

                })
                break;
            case 'ban':
                member.guild.members.ban(executor.id).then().catch(err => { })
                await member.guild.bans.fetch(executor).then(async un => {
                    const owner = client.users.cache.get((await member.guild.fetchOwner()).user.id)
                    const embed = new MessageEmbed()
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                        .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                        .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                        .setDescription(`
                        **Hello ${member.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Added Bot And i punished Him !
                        `)
                        .setColor('#00ebff')
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })
                }).catch(async err => {
                    const embed = new MessageEmbed()
                        .setColor('ffff00')
                        .setDescription(`
                        **Hello ${member.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Added Bot ,and I don't have permissions and I can't punish  ${executor.tag}
                        `)
                        .setTitle('Alert  <:Alert:939351669341323264> ')
                        .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                    const owner = client.users.cache.get((await member.guild.fetchOwner()).user.id)
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })
                });
                break;
            default:
                break;
        }




    }
})

client.on("roleUpdate", async function (oldRole, newRole) {
    const result = await Data.findOne({ guildId: oldRole.guild.id });
    if (!result) return;
    if (oldRole.permissions !== newRole.permissions) {
        const oldPerms = oldRole.permissions.serialize();
        const newPerms = newRole.permissions.serialize();

        const permUpdated = [];
        const fetchedLogs = await newRole.guild.fetchAuditLogs({
            limit: 1,
            type: 'ROLE_UPDATE',
        });

        const banLog = fetchedLogs.entries.first();


        if (!banLog) return console.log(` no audit log could be found.`);


        const { executor } = banLog;

        if (result.whitelist.all.includes(executor.id)) return;

        if (executor.id === (await oldRole.guild.fetchOwner()).user.id) return;

        if (result.ability.anti_dang_role_perm) {
            for (const [key, element] of Object.entries(oldPerms)) {
                if (newPerms[key] !== element) permUpdated.push(key);
            }

            if (oldRole.permissions > newRole.permissions) {


                console.log(`${newRole.toString()} has lost the ${permUpdated.join(", ")} permission`)

            } else if (oldRole.permissions < newRole.permissions) {


                if (permUpdated.join(", ").includes('ADMINISTRATOR') || permUpdated.join(", ").includes('KICK_MEMBERS') || permUpdated.join(", ").includes('BAN_MEMBERS') || permUpdated.join(", ").includes('MANAGE_GUILD') || permUpdated.join(", ").includes('MANAGE_WEBHOOKS') || permUpdated.join(", ").includes('MANAGE_ROLES') || permUpdated.join(", ").includes('MANAGE_CHANNELS')) {
                    console.log('1')
                    newRole.setPermissions(oldRole.permissions)
                    console.log(`${executor.tag} Give Dangerus perm to ${oldRole.name}`)

                }
            }
        }




        //----------------------------------------------------------------


        const limit = result.limit.role.update
        if (!limit) return;
        const punish = result.punishment
        if (!result.limit.role.isEnable) return;
        if (limit === 0) return;
        if (limit === null) return;
        if (!oldRole.guild) return;


        if (result.whitelist.all.includes(executor.id)) return;
        if (client.user.id === executor.id) return;

        if (executor.id === (await oldRole.guild.fetchOwner()).user.id) return;
        db.add(`${executor.id}_${oldRole.guild.id}_roleUpdateLimit`, 1)
        let userLimit = db.get(`${executor.id}_${oldRole.guild.id}_roleUpdateLimit`)


        switch (punish) {
            case 'removerole':
                newRole.setPermissions(oldRole.permissions)
                newRole.guild.roles.cache.forEach(async role => {
                    if (role.members.get(executor.id)) {
                        console.log(`+ ${role.name}`)
                        if (role.id !== role.guild.id) {
                            const guild = client.guilds.cache.get(role.guild.id);
                            const roled = role.guild.roles.cache.get(role.id);
                            const member = await guild.members.fetch(executor.id);

                            console.log(executor.id)
                            member.roles.remove(roled).then(async eu => {
                                const owner = client.users.cache.get((await role.guild.fetchOwner()).user.id)
                                const embed = new MessageEmbed()
                                    .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                                    .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                                    .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                                    .setDescription(`
                **Hello ${role.guild.name} Owner <a:crown:939352514455797881> ,**
                ${executor.tag} Try to give dangerous permission to ${oldRole.name} , I remove dangerous permission And i punished Him !
                `)
                                    .setColor('#00ebff')
                                owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })


                            }).catch(async err => {
                                const embed = new MessageEmbed()
                                    .setColor('ffff00')
                                    .setDescription(`
            **Hello ${role.guild.name} Owner <a:crown:939352514455797881> ,**
            ${executor.tag} Try to give dangerous permission to ${oldRole.name} , I remove dangerous permission ,and I don't have permissions and I can't punish  ${executor.tag}
            `)
                                    .setTitle('Alert  <:Alert:939351669341323264> ')
                                    .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                                    .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                                const owner = client.users.cache.get((await role.guild.fetchOwner()).user.id)
                                owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })

                            })
                        } else {
                            return;
                        }
                    } else {
                        return;
                    }
                })
                db.set(`${executor.id}_${oldRole.guild.id}_roleUpdateLimit`, 0)
                break;
            case 'kick':
                newRole.setPermissions(oldRole.permissions)
                newRole.guild.members.kick(executor.id).then(async eu => {
                    const owner = client.users.cache.get((await newRole.guild.fetchOwner()).user.id)
                    const embed = new MessageEmbed()
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                        .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                        .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                        .setDescription(`
    **Hello ${newRole.guild.name} Owner <a:crown:939352514455797881> ,**
    ${executor.tag} Try to give dangerous permission to ${oldRole.name} , I remove dangerous permission And i punished Him !
    `)
                        .setColor('#00ebff')
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })


                }).catch(async err => {
                    const embed = new MessageEmbed()
                        .setColor('ffff00')
                        .setDescription(`
**Hello ${newRole.guild.name} Owner <a:crown:939352514455797881> ,**
${executor.tag} Try to give dangerous permission to ${oldRole.name} , I remove dangerous permission ,and I don't have permissions and I can't punish  ${executor.tag}
`)
                        .setTitle('Alert  <:Alert:939351669341323264> ')
                        .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                    const owner = client.users.cache.get((await role.guild.fetchOwner()).user.id)
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })

                })
                db.set(`${executor.id}_${oldRole.guild.id}_roleUpdateLimit`, 0)
                break;
            case 'ban':
                newRole.setPermissions(oldRole.permissions)
                newRole.guild.members.ban(executor.id).then().catch(err => { })
                await newRole.guild.bans.fetch(executor).then(async un => {
                    const owner = client.users.cache.get((await newRole.guild.fetchOwner()).user.id)
                    const embed = new MessageEmbed()
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                        .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                        .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                        .setDescription(`
    **Hello ${newRole.guild.name} Owner <a:crown:939352514455797881> ,**
    ${executor.tag} Try to give dangerous permission to ${oldRole.name} , I remove dangerous permission  And i punished Him !
    `)
                        .setColor('#00ebff')
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })
                }).catch(async err => {
                    const embed = new MessageEmbed()
                        .setColor('ffff00')
                        .setDescription(`
    **Hello ${newRole.guild.name} Owner <a:crown:939352514455797881> ,**
    ${executor.tag}  ${executor.tag} Try to give dangerous permission to ${oldRole.name} , I remove dangerous permission ,and I don't have permissions and I can't punish  ${executor.tag}
    `)
                        .setTitle('Alert  <:Alert:939351669341323264> ')
                        .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                    const owner = client.users.cache.get((await role.guild.fetchOwner()).user.id)
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })
                });
                db.set(`${executor.id}_${oldRole.guild.id}_roleUpdateLimit`, 0)
                break;
            default:
                break;
        }

        console.log(userLimit)
    }
})

client.on('channelDelete', async (channel) => {
    const result = await Data.findOne({ guildId: channel.guild.id });
    if (!result) return;
    if (!channel.guild) return;

    const fetchedLogs = await channel.guild.fetchAuditLogs({
        limit: 1,
        type: 'CHANNEL_DELETE',
    });
    const deletionLog = fetchedLogs.entries.first();


    if (!deletionLog) return console.log(`Not Found`);

    const { executor } = deletionLog;
if(!executor ) return;
    if (executor.id === (await channel.guild.fetchOwner()).user.id) return;
    if (executor.id == client.user.id) return console.log(`bot is whitelist`)
    let status = result.ability.channel_freeze
    if (status) {
        if (result.whitelist.all.includes(executor.id)) {
            return console.log('in whitelist');
        } else {
            channel.clone()
        }
    } else {
        return console.log('0')
    }

})

client.on('messageCreate', async message => {

    const result = await Data.findOne({ guildId: message.guild.id });
    if (!result) return
    if (!message.guild) return;
    if (result.whitelist.all.includes(message.author.id)) return;
    if (!result.ability.anti_link) return;
    if (executor.id === (await message.guild.fetchOwner()).user.id) return;
    if (message.content.includes('discord.gg/')) {
        if (message.content.includes('https://')) {
            let msgedit = message.content.split('https://')
            let msgedit2 = msgedit[1].split('/')
            client.fetchInvite(msgedit2[1]).then(i => {
                if (!i.guild) return;
                console.log(i.guild.name)
                if (message.guild.id !== i.guild.id) {
                    message.delete()
                    message.channel.send(`${message.author} Advertise is closed for ${message.guild.name} `).then(message => {
                        setTimeout(() => {
                            message.delete()
                        }, 3000);
                    })
                } else {
                    return;
                }
            }).catch(e => { message.delete() })

        } else if (message.content.includes('http://')) {
            let msgedit = message.content.split('http://')
            let msgedit2 = msgedit[1].split('/')
            client.fetchInvite(msgedit2[1]).then(i => {
                if (!i.guild) return;
                console.log(i.guild.name)
                if (message.guild.id !== i.guild.id) {
                    message.delete()
                    message.channel.send(`${message.author} Advertise is closed for ${message.guild.name} `).then(message => {
                        setTimeout(() => {
                            message.delete()
                        }, 3000);
                    })
                } else {
                    return;
                }
            }).catch(e => { message.delete() })
        } else {
            let msgedit = message.content.split('/')
            client.fetchInvite(msgedit[1]).then(i => {
                if (!i.guild) return;
                console.log(i.guild.name)

                if (message.guild.id !== i.guild.id) {
                    message.delete()
                    message.channel.send(`${message.author} Advertise is closed for ${message.guild.name} `).then(message => {
                        setTimeout(() => {
                            message.delete()
                        }, 3000);
                    })
                } else {
                    return;
                }
            }).catch(e => { message.delete() })
        }
    }
})

client.on('messageDelete', async message => {
    const embedddddddd = new MessageEmbed()
        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
        .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
        .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
        .setDescription(`
              **Hello ${message.guild.name} Owner <a:crown:939352514455797881> ,**
              ${message.author} this user is abusing the chat with ghost ping and i give jim 5 minute timeout ,
        `)
        .setColor('#00ebff')
    const owner = client.users.cache.get((await message.guild.fetchOwner()).id)
    const result = await Data.findOne({ guildId: message.guild.id });
    if (!result) return
    if (!message.guild) return;
    if (result.whitelist.all.includes(message.author.id)) return;
    if (!result.ability.anti_ghost_ping) return;
    if (executor.id === (await message.guild.fetchOwner()).user.id) return;
    if(guild.members.cache.get(message.author.id).roles.highest.position > guild.members.cache.get(client.user.id).roles.highest.position) return owner.send({ content: `Hello ${message.guild.name} Owner , ${message.author} is ghost pinged on server and  cant take action because my permission or role isn't enough for timeout members please fix that ! <:983635028867162112:983635028867162112>`})
    if (message.mentions.members.size <= 3) return;
    


    const guild = message.guild

    guild.members.cache.get(message.author.id).timeout(5 * 60 * 1000).then().catch(console.error).then().catch();
    db.set(`limitgp_${message.author.id}_${message.guild.id}`, 0)
    owner.send({ content: `Hello ${message.guild.name} Owner`, embeds: [embedddddddd] })



})

client.on('webhookUpdate',async (channel) => { 
    const result = await Data.findOne({ guildId: channel.guild.id });
    if (!result) return;
    if (!result.limit.webhook.isEnable) return;
    const limit = result.limit.webhook.action
    if (!limit) return;
    const punish = result.punishment
    if (limit === 0) return;
    if (limit === null) return;
    if (!channel.guild) return;
    if( ( (await channel.guild.fetchAuditLogs({ limit: 1,})).entries.first().action !== 'WEBHOOK_CREATE'  )) return

   



    const executor = (await channel.guild.fetchAuditLogs({ limit: 1,})).entries.first().executor;

    if (result.whitelist.all.includes(executor.id)) return;
    if (client.user.id === executor.id) return;

   if (executor.id === (await channel.guild.fetchOwner()).user.id) return;
    db.add(`${executor.id}_${channel.guild.id}_webhookCreateLimit`, 1)
    let userLimit = db.get(`${executor.id}_${channel.guild.id}_webhookCreateLimit`)


    if (userLimit == limit) {

        switch (punish) {
            case 'removerole':
                channel.guild.roles.cache.forEach(async role => {
                    if (role.members.get(executor.id)) {
                        console.log(`+ ${role.name}`)
                        if (role.id !== channel.guild.id) {
                            const guild = client.guilds.cache.get(channel.guild.id);
                            const roled = channel.guild.roles.cache.get(role.id);
                            const member = await guild.members.fetch(executor.id);

                            console.log(executor.id)
                            member.roles.remove(roled).then(async eu => {
                                const owner = client.users.cache.get((await channel.guild.fetchOwner()).user.id)
                                const embed = new MessageEmbed()
                                    .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                                    .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                                    .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                                    .setDescription(`
                                    **Hello ${channel.guild.name} Owner <a:crown:939352514455797881> ,**
                                    ${executor.tag} Was Created ${limit} Webhook's And i punished Him !
                                    `)
                                    .setColor('#00ebff')
                                owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })


                            }).catch(async err => {
                                const embed = new MessageEmbed()
                                    .setColor('ffff00')
                                    .setDescription(`
                                **Hello ${channel.guild.name} Owner <a:crown:939352514455797881> ,**
                                ${executor.tag} Was Created ${limit} Webhook's ,and I don't have permissions and I can't punish  ${executor.tag}
                                `)
                                    .setTitle('Alert  <:Alert:939351669341323264> ')
                                    .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                                    .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                                const owner = client.users.cache.get((await channel.guild.fetchOwner()).user.id)
                                owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })

                            })
                        } else {
                            return;
                        }
                    } else {
                        return;
                    }
                })

                db.set(`${executor.id}_${channel.guild.id}_webhookCreateLimit`, 0)
                break;
            case 'ban':
                console.log('1')
                channel.guild.members.ban(executor.id).then().catch(err => { })
                await channel.guild.bans.fetch(executor).then(async un => {
                    const owner = client.users.cache.get((await channel.guild.fetchOwner()).user.id)
                    const embed = new MessageEmbed()
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                        .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                        .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                        .setDescription(`
                        **Hello ${channel.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Created ${limit} Webhook's And i punished Him !
                        `)
                        .setColor('#00ebff')
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })
                }).catch(async err => {
                    const embed = new MessageEmbed()
                        .setColor('ffff00')
                        .setDescription(`
                        **Hello ${channel.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Created ${limit} Webhook's ,and I don't have permissions and I can't punish  ${executor.tag}
                        `)
                        .setTitle('Alert  <:Alert:939351669341323264> ')
                        .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                    const owner = client.users.cache.get((await channel.guild.fetchOwner()).user.id)
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })
                });
                db.set(`${executor.id}_${channel.guild.id}_webhookCreateLimit`, 0)
                break;
            case 'kick':
                console.log('1')
                channel.guild.members.kick(executor.id).then(async eu => {
                    const owner = client.users.cache.get((await channel.guild.fetchOwner()).user.id)
                    const embed = new MessageEmbed()
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                        .setThumbnail('https://media.discordapp.net/attachments/939338555254272040/939359432477904897/1f6e1.png')
                        .setTitle('Don\'t Worry  <:983651069823434752:983651069823434752>')
                        .setDescription(`
                        **Hello ${channel.guild.name} Owner <a:crown:939352514455797881> ,**
                        ${executor.tag} Was Created ${limit} Webhook's And i punished Him !
                        `)
                        .setColor('#00ebff')
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })


                }).catch(async err => {
                    const embed = new MessageEmbed()
                        .setColor('ffff00')
                        .setDescription(`
                    **Hello ${channel.guild.name} Owner <a:crown:939352514455797881> ,**
                    ${executor.tag} Was Created ${limit} Webhook's ,and I don't have permissions and I can't punish  ${executor.tag}
                    `)
                        .setTitle('Alert  <:Alert:939351669341323264> ')
                        .setThumbnail('https://media.discordapp.net/attachments/981679642371055687/983445697732968488/New_Project_1.png')
                        .setFooter('Wabbit is the guardian of your community, so leave everything to Wabbit', client.user.avatarURL({ dynamic: true }))
                    const owner = client.users.cache.get((await channel.guild.fetchOwner()).user.id)
                    owner.send({ content: `${owner}`, embeds: [embed] }).then().catch(err => { })

                })
                db.set(`${executor.id}_${channel.guild.id}_webhookCreateLimit`, 0)
                break;
            default:
                break;
        }



    }

})

client.on('interactionCreate',async interaction => {
    const row = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId('primary')
            .setLabel('Create Invite Link')
            .setStyle('PRIMARY')
            .setDisabled(true),
    );
	if (!interaction.isButton()) return;
    if (interaction.customId == "primary") {
        const guild = client.guilds.cache.get('967103945770160188')
        const channel = guild.channels.cache.get('984782666371055636')
        await channel.createInvite({ maxAge: 0, maxUses: 0 }).then(async (invite) => {
          interaction.update({content:`${guild.name} - ${invite.url}`, components: [row],ephemeral: true})
        })
        

    }
});
//================================================
client.login(bot.token);

client.on('interactionCreate',(interaction) => {
    const { dev } = require(
        './config/config.json'
      )
      if (!interaction.isCommand()) return;

      if (interaction.commandName === 'atdb') {
     
        
        if (!dev.includes(interaction.user.id)) return;
  
        client.guilds.cache.forEach(async g => {
            let result = await Data.findOne({guildId : g.id})
            if(result) return;
            await addGuildToDataBase(g.id)
            interaction.channel.send(`${g.name} setted to Database`)
        })
      }
     
})





