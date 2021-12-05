const { Client, Intents, Collection, MessageEmbed } = require("discord.js")
const didYouMean = require("./utils/didYouMean")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const embedBase = require("./utils/embedBase")
const { getVCManager } = require("./utils/voiceConnectionManager")
const fs = require("fs")
const botIntents = new Intents()
botIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.DIRECT_MESSAGES)
const rest = new REST({ version: "9" }).setToken(process.env.TOKEN)
const slashcommanddata = []
const botClient = new Client({ intents: botIntents })
const { AutoPoster } = require('topgg-autoposter')
const dataCache = require("./utils/dataCache")
const { serverdata } = require("../db")

botClient.commands = new Collection()
botClient.aliases = new Collection()

const cmdFiles = fs.readdirSync("discord/commands").filter((file) => (file.endsWith(".js")))

process.on('unhandledRejection', error => {
  console.log('Unhandled promise rejection:', error);
  try {
    botClient.channels.cache.find(channel => channel.id == "907947763025719387").send({ embeds: [new embedBase("Error", error.toString(), [{ name: "Stack Trace:", value: "```" + error.stack + "```" }])] })
  } catch (err) {
    console.log("Error Occurred While Reporting Error")
  }
});

process.on('uncaughtException', error => {
  console.log('Uncaught exception:', error);
  try {
    botClient.channels.cache.find(channel => channel.id == "907947763025719387").send({ embeds: [new embedBase("Error", error.toString(), [{ name: "Stack Trace:", value: "```" + error.stack + "```" }])] })
  } catch (err) {
    console.log("Error Occurred While Reporting Error")
  }
});

if(process.env.ENVIRONMENT !== "Dev"){
  AutoPoster(process.env.TOP_GG_TOKEN, botClient)
  .on('posted', () => {
    console.log('Posted stats to Top.gg!')
  })
}

cmdFiles.forEach((file) => {
  const module = require(`./commands/${file}`)
  const command = new module()
  botClient.commands.set(command.name, command)
  command.aliases.forEach((alias) => {
    botClient.aliases.set(alias, command.name)
  })
})

for (let cmd of botClient.commands) {
  if (!cmd[1].slashoptions) {
    slashcommanddata.push({ name: cmd[1].name, description: cmd[1].desc })
  } else {
    slashcommanddata.push({ name: cmd[1].name, description: cmd[1].desc, options: cmd[1].slashoptions })
  }
}

/*
function handleGuild(id) {
  console.log(`Began refreshing slash commands for guild: ${id}`)
  try {
    rest.put(Routes.applicationGuildCommands(botClient.user.id, id), { body: [] })
  } catch (err) {
    console.log(`An error occurred while refreshing slash commands for the guild ${id}`)
    console.log(err)
  }
}
*/


botClient.on("guildCreate", (guild) => {
  console.log(`[Melody Stats]: I'm in ${botClient.guilds.cache.size} servers.`)
  new dataCache.serverCache(guild.id)
})

botClient.on("interactionCreate", (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  if (botClient.commands.get(interaction.commandName)) {
    if (botClient.commands.get(interaction.commandName).commandserveronly && interaction.guild.id !== process.env.COMMAND_SERVER_ID) {
      interaction.reply({ content: "This command can only be ran in the melody server.", ephemeral: true })
      return;
    }
    botClient.commands.get(interaction.commandName).execute("interaction", interaction, interaction.options._hoistedOptions)
  }
})


botClient.on("ready", async () => {
  console.log(`[Melody Stats]: I'm in ${botClient.guilds.cache.size} servers.`)
  const statuses = [["WATCHING", "The T:Riza Corporation"], ["PLAYING", "Some good tunes!"], ["PLAYING", "The legend that was on the cord!"], ["PLAYING", `${process.env.PREFIX}help | ${process.env.PREFIX}info`], ["WATCHING", "Jimmy!"], ["WATCHING", `${botClient.guilds.cache.size} servers!`], ["WATCHING", "melody.triza.dev/invite"], ["PLAYING", "For Support go to: melody.triza.dev/join"]]
  rest.put(Routes.applicationCommands(botClient.user.id), { body: slashcommanddata })
  for (let guild of botClient.guilds.cache) {
    new dataCache.serverCache(guild[1].id)
  }

  for (let part of await serverdata.find()) {
    new dataCache.serverCache(part.serverId, part)
  }
  setInterval(function () {
    let selectedstatus = statuses[Math.floor(Math.random() * statuses.length)]
    botClient.user.setActivity(selectedstatus[1], { type: selectedstatus[0] })
  }, 10000)
  /*
  const commands = botClient.application.commands

  for(let cmd of botClient.commands){
      if(cmd[1].slash){
          console.log(cmd[1].name)
          for (let guild of botClient.guilds.cache){
              guild[1].commands.create({
                  name: cmd[1].name,
                  description: cmd[1].desc
              })
          }
          commands.create({
              name: cmd[1].name,
              description: cmd[1].desc
          })
      }
  }
  */

  console.log(`Logged In As ${botClient.user.username}#${botClient.user.discriminator}`)
})

botClient.on("debug", (message) => {
  console.log(message)
})

botClient.on("warn", console.log)

botClient.on("messageCreate", (message) => {
  let prefix = process.env.PREFIX
  if(message.author.bot == true){
    return 
  }
  if(!message.guild){
    message.channel.send(":wave: I only respond to messages in servers..")
    return;
  }
  if (dataCache.fetchServerCache(message.guild.id) && dataCache.fetchServerCache(message.guild.id).data.prefix) {
    prefix = dataCache.fetchServerCache(message.guild.id).data.prefix
  }
  if (message.content == `<@!${botClient.user.id}>`) {
    let data = dataCache.fetchServerCache(message.guild.id)
    let fields = []
    fields.push({ name: "Prefix:", value: data.data.prefix || process.env.PREFIX })
    if (data.data.musicLockEnabled !== undefined) {
      fields.push({ name: "Music Channel Enabled:", value: data.data.musicLockEnabled.toString() })
    }
    if (data.data.musicChannelId) {
      fields.push({ name: "Music Channel:", value: `<#${data.data.musicChannelId}>` })
    }
    if (data.data.djRoleEnabled !== undefined) {
      fields.push({ name: "DJ Role Enabled:", value: data.data.djRoleEnabled.toString() })
    }
    if (data.data.djRoleId) {
      fields.push({ name: "DJ Role:", value: `<@&${data.data.djRoleId}>` })
    }
    if (data.data.announcementsChannel) {
      fields.push({ name: "Announcements Channel:", value: `<#${data.data.announcementsChannel}>` })
    }
    message.reply({ embeds: [new embedBase("Server Data", "All of the data Melody has on this server is listed below.", fields)] })
  }
  if (!message.content.startsWith(prefix)) { return; }
  const data = message.content.split(prefix)[1].split(" ")
  const command = data[0]
  const args = data.slice(1)
  const cmdfile = botClient.commands.get(command) || botClient.commands.get(botClient.aliases.get(command))
  if (!cmdfile) {
    let cmdnames = []
    for (let cmd of botClient.commands) {
      cmdnames.push(cmd[1].name)
    }
    let result = didYouMean(command, cmdnames)
    console.log(result)
    if (result.result) {
      message.channel.send({ embeds: [new embedBase("Autocomplete", `Did you mean **${prefix}${result.result}**?`)] })
    }
  } else {
    if (cmdfile.commandserveronly && message.guild.id !== process.env.COMMAND_SERVER_ID) {
      message.channel.send({ embeds: [new embedBase("Command Server Only", "This command can only be ran in the main melody server.")] })
      return;
    }
    if (cmdfile.slashonly) {
      message.channel.send({ embeds: [new embedBase("Slash Only", "This command is slash only.")] })
      return;
    }
    cmdfile.execute("chat", message, args)
  }
})

botClient.on("voiceStateUpdate", (oldState, newState) => {
  if (oldState.channelId !== null) {
    let channeldata = botClient.channels.cache.find(channel => channel.id == oldState.channelId)
    if (channeldata.members.size - 1 == 0) {
      setTimeout(function () {
        if (channeldata.members.size - 1 == 0 && getVCManager(oldState.guild.id) && getVCManager(oldState.guild.id).currentChannelId == oldState.channelId) {
          getVCManager(oldState.guild.id).terminateManager()
        }
      }, 60000)
    }
  }
})
botClient.login(process.env.TOKEN)

module.exports.Bot = botClient