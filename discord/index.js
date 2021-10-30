const {Client, Intents, Collection, MessageEmbed} = require("discord.js")
const didYouMean = require("./utils/didYouMean")
const {REST} = require("@discordjs/rest")
const {Routes} = require("discord-api-types/v9")
const embedBase = require("./utils/embedBase") 
const {getVCManager} = require("./utils/voiceConnectionManager") 
const fs = require("fs")
const botIntents = new Intents()
botIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES)
const rest = new REST({version: "9"}).setToken(process.env.TOKEN)
const slashcommanddata = []
let botClient = new Client({intents: botIntents})
let dataCache = require("./utils/dataCache")
let {serverdata} = require("../db")

botClient.commands = new Collection()
botClient.aliases = new Collection()

const cmdFiles = fs.readdirSync("discord/commands").filter((file) => (file.endsWith(".js")))

process.on('unhandledRejection', error => {
	console.log('Unhandled promise rejection:', error);
});

cmdFiles.forEach((file) => {
    const module = require(`./commands/${file}`)
    const command = new module()
    botClient.commands.set(command.name, command)
    command.aliases.forEach((alias) => {
        botClient.aliases.set(alias, command.name)
    })
})

for(let cmd of botClient.commands){
    if(!cmd[1].slashoptions){
        slashcommanddata.push({name: cmd[1].name, description: cmd[1].desc})
    }else{
        slashcommanddata.push({name: cmd[1].name, description: cmd[1].desc, options: cmd[1].slashoptions})
    }
}

function handleGuild(id){
    console.log(`Began refreshing slash commands for guild: ${id}`)
     try{
         rest.put(Routes.applicationGuildCommands(botClient.user.id, id), {body: slashcommanddata})
    }catch(err){
        console.log(`An error occurred while refreshing slash commands for the guild ${id}`)
    }
}

botClient.on("guildCreate", (guild) => {
    handleGuild(guild.id)
})

botClient.on("interactionCreate", (interaction) => {
    if (!interaction.isCommand()){
        return;
    }
    if(botClient.commands.get(interaction.commandName)){
        botClient.commands.get(interaction.commandName).execute("interaction", interaction, interaction.options._hoistedOptions)
    }
})


botClient.on("ready", async () => {
    const statuses = [["WATCHING", "The T:Riza Corporation"], ["PLAYING", "Some good tunes!"], ["PLAYING", "The legend that was on the cord!"], ["PLAYING", `${process.env.PREFIX}help | ${process.env.PREFIX}info`], ["WATCHING", "Jimmy!"], ["WATCHING", `${botClient.guilds.cache.size} servers!`]]
    for (let guild of botClient.guilds.cache){
        handleGuild(guild[1].id)
    }
    for (let part of await serverdata.find()){
        new dataCache.serverCache(part.serverId, part)
    }
    setInterval(function(){
        let selectedstatus = statuses[Math.floor(Math.random() * statuses.length)]
        botClient.user.setActivity(selectedstatus[1], {type: selectedstatus[0]})
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

botClient.on("messageCreate", (message) => {
    let prefix = process.env.PREFIX
    if(dataCache.fetchServerCache(message.guild.id) && dataCache.fetchServerCache(message.guild.id).data.prefix){
        prefix = dataCache.fetchServerCache(message.guild.id).data.prefix
    }
    if(!message.content.startsWith(prefix)){return;}
    const data = message.content.split(prefix)[1].split(" ")
    const command = data[0]
    const args = data.slice(1)
    const cmdfile = botClient.commands.get(command) || botClient.commands.get(botClient.aliases.get(command))
    if(!cmdfile){
    let cmdnames = []
      for (let cmd of botClient.commands){
        cmdnames.push(cmd[1].name)
      }
      let result = didYouMean(command, cmdnames)
      console.log(result)
      if(result.result){
          message.channel.send({embeds: [new embedBase("Autocomplete", `Did you mean **${process.env.PREFIX}${result.result}**?`)]})
      }
    }else{
      if(cmdfile.slashonly){
          message.channel.send({embeds:[new embedBase("Slash Only", "This command is slash only.")]})
          return;
      }
      cmdfile.execute("chat", message, args)
    }
})

botClient.on("voiceStateUpdate", (oldState, newState) => {
  if(oldState.channelId !== null){
    let channeldata = botClient.channels.cache.find(channel => channel.id == oldState.channelId)
    if (channeldata.members.size -1 == 0){
       setTimeout(function(){
      if(channeldata.members.size -1 == 0 && getVCManager(oldState.guild.id) && getVCManager(oldState.guild.id).currentChannelId == oldState.channelId){
       getVCManager(oldState.guild.id).terminateManager()
      }
    },60000)
    }
   
  }
})
botClient.login(process.env.TOKEN)

module.exports.Bot = botClient