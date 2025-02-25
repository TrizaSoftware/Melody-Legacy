const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const componentBase = require("../utils/componentBase")
const { VoiceConnectionManager, getVCManager } = require("../utils/voiceConnectionManager")
const voice = require("@discordjs/voice")
const usetube = require("usetube")
let dataCache = require("../utils/dataCache")
const bot = require("../")
const { spawn } = require("child_process")
const { Collector } = require("discord.js")


module.exports = class Command extends commandBase {
  constructor() {
    super("play", "Music", ["p", "song"], "Plays Music", false, [{ name: "search_term", type: 3, description: "The song you want to play.", required: true }])
  }
  async execute(message, args) {
      // message.reply({embeds: [new embedBase("Test", "Test", [{name: "test", value: "test", inline: true}])]})
      let member = message.guild.members.cache.find(member => member.id == message.user.id)
      message.member = member

    if (!message.member.voice.channel) {
         message.reply({ embeds: [new embedBase("Error", "You must be in a Voice Channel to run this command.")] })
    } else {
      let serverdata = dataCache.fetchServerCache(message.guild.id)
      if (serverdata && serverdata.data.musicLockEnabled && serverdata.data.musicChannelId !== message.member.voice.channel.id) {
           message.reply({ embeds: [new embedBase("Error", "You must be in the music channel to play songs.")] })
        return;
      }
      let query = args[0].value
      /*
      if (args[0] && type == "chat") {
        query = args.join(" ")
      } else if (!args[0] && type == "chat") {
        message.reply({ embeds: [new embedBase("Error", "You must specify a search term!")] })
        return
      } else {
        query = args[0].value
      }
      */
     if(message.member.voice.channel.permissionsFor(bot.Bot.user.id).has("CONNECT")){
      if (!getVCManager(message.guild.id)) {
        voice.joinVoiceChannel({ channelId: message.member.voice.channel.id, guildId: message.guild.id, adapterCreator: message.member.voice.channel.guild.voiceAdapterCreator })
        new VoiceConnectionManager(message.guild.id, message.member.voice.channel.id)
      } else if (getVCManager(message.guild.id).currentChannelId !== message.member.voice.channel.id) {
        voice.joinVoiceChannel({ channelId: message.member.voice.channel.id, guildId: message.guild.id, adapterCreator: message.member.voice.channel.guild.voiceAdapterCreator })
      }
     }else{
        message.reply({embeds: [new embedBase("Error", "I can't join the voice channel.")]})
        return
     }
      let vcm = getVCManager(message.guild.id)
      if (vcm.eventEmitter._eventsCount == 0) {
        vcm.eventEmitter.on("songData", (type, data) => {
          if (type == "playing") {
            if (vcm.shouldLoop) { return; }
            message.channel.send({ embeds: [new embedBase("Now Playing", `Now Playing: ${data.name}`)] })
          } else if (type == "end") {
            if (vcm.shouldLoop) { return; }
            message.channel.send({ embeds: [new embedBase("Song Ended", `The Song Has Ended.`)] })
          } else if (type == "timeout") {
            message.channel.send({ embeds: [new embedBase("Timeout", `No new songs have been played in 5 minutes so I've disconnected from the voice channel.`)] })
            vcm.eventEmitter.removeAllListeners(["songData"])
          } else if (type == "error") {
            message.channel.send({ embeds: [new embedBase("Error", `An error has occurred. ${data}`)] })
            vcm.eventEmitter.removeAllListeners(["songData"])
            vcm.terminateManager()
          } else if(type == "sendMessageInChannel"){
            message.channel.send(data)
          }
        })
      }
      if (query.startsWith("https://open.spotify.com")){
        let data = await bot.Bot.erelajs.search(query)
        if (data.loadType == "PLAYLIST_LOADED"){
            message.reply({embeds: [new embedBase("Added Tracks To Queue", "Successfully added the tracks from the playlist to queue.")]})
          for (let track of data.tracks){
              vcm.addToQueue(track)
          }
        }else{
           message.reply({embeds: [new embedBase("Added To Queue", `Added ${data.tracks[0].author} - ${data.tracks[0].title} to the queue.`)]})
           vcm.addToQueue(data.tracks[0])
        }
      }else{
        message.deferReply()
        let data = await bot.Bot.erelajs.search(query)
        let fields = []
        let datatoindex = []
        //let componentData = []
        if (data && data.tracks[0]) {
          for (let i = 0; i < 5; i++) {
            let actualNumber = i + 1
            if (data.tracks[i]) {
              fields[i] = { name: `${actualNumber.toString()}.`, value: data.tracks[i].title, inline: false }
              datatoindex[i] = {name: data.tracks[i].title, url: data.tracks[i].uri}
              //componentData[i] = { style: "SUCCESS", text: actualNumber.toString() }
            }
          }
        } else {
          message.editReply({ embeds: [new embedBase("Error", "No Results.")] })
          return
        }
        let embed = new embedBase("Pick a Song", "Please pick a song.", fields, "Prompt cancels in 1 minute")
       // let components = new componentBase("button", componentData)
        
        //setTimeout(function(){message.editReply({ embeds: [embed], components: [components, new componentBase("button", [{ text: "Cancel", style: "DANGER" }])] })},1000)
        setTimeout(function(){
          message.editReply({embeds: [embed]})
        }, 1000)
        const filter = newMessage => newMessage.author.id === message.user.id
        let messageCollector = message.channel.createMessageCollector({filter, max:1, time: 60000})
        messageCollector.on('collect', newMessage => {
          let selectedoption = datatoindex[parseInt(newMessage.content) - 1]
          if (!selectedoption){
            newMessage.reply({embeds: [new embedBase("Error", "That's not a valid song.")]})
            return
          }else{
            let vcm = getVCManager(message.guild.id)
            if (vcm){
              vcm.addToQueue(selectedoption)
              newMessage.reply({ embeds: [new embedBase("Added To Queue", `Added ${selectedoption.name} to the queue!`)]})
            }
          }
        })
        messageCollector.on("end", () => {
          message.editReply({embeds: [embed], components: [new componentBase("button", [
           {
            text: "Completed Prompt", 
            style: "SUCCESS",
            disabled: true
           } 
          ])] })
        })
        /*
        const collector = message.channel.createMessageComponentCollector({ componentType: 'BUTTON', time: 60000 });
        collector.on("collect", async i => {
          let response = await message.fetchReply()
          if(i.message.id !== response.id){
            return
          }
          if (i.user.id == message.member.id) {
            collector.stop()
            if (i.customId == "Cancel") {
                i.reply({ embeds: [new embedBase("Prompt Cancelled", "The prompt has been successfully cancelled.")] })
              return;
            }
            let selectedoption = datatoindex[parseInt(i.customId) - 1]
            let vcm = getVCManager(message.guild.id)
            if (getVCManager(message.guild.id)) {
              vcm.addToQueue(selectedoption)
                i.reply({ embeds: [new embedBase("Added To Queue", `Added ${selectedoption.name} to the queue!`)] })
            }
          } else {
            i.reply({ embeds: [new embedBase("Error", "You can't click these buttons.")], ephemeral: true })
          }
        })

        collector.on("end", () => {
            message.editReply({ embeds: [embed], components: [] })
        })
       */
        //Old Code For Handling Songs
        /*
      let filter = m => m.author.id == message.member.id
      message.channel.awaitMessages({filter, max: 1, time: 60000, errors:["time"]}).then(data => {
        if(data.first().content.toLowerCase() == "cancel"){
          message.channel.send({embeds: [new embedBase("Prompt Cancelled", "The prompt has been successfully cancelled.")]})
        }else{
          if(datatoindex[parseInt(data.first().content) - 1]){
            let selectedoption = datatoindex[parseInt(data.first().content) - 1]
            let vcm = getVCManager(message.guild.id)
            if(getVCManager(message.guild.id)){
              let response = vcm.addToQueue(selectedoption)
              if (response == "addedToQueue"){
                message.channel.send({embeds: [new embedBase("Added To Queue", `Added [${selectedoption.name}](${selectedoption.url}) to the queue!`)]})
              }
              if(vcm.eventEmitter._eventsCount == 0){
                let othermsg = data.first()
                othermsg.react("<a:loading:740018948522901515>")
                vcm.eventEmitter.on("songData", (type, data) => {
                  if (type == "playing"){
                    message.channel.send({embeds: [new embedBase("Now Playing",  `Now Playing: [${data.name}](${data.url})`)]})
                    othermsg.reactions.removeAll()
                    .catch(error => console.log('Failed to clear reactions:', error));
                  }else if(type == "end"){
                    message.channel.send({embeds: [new embedBase("Song Ended",  `The Song Has Ended.`)]})
                  }else if(type == "queueEnd"){
                    message.channel.send({embeds: [new embedBase("Queue Ended",  `The Queue Has Ended.`)]})
                    vcm.eventEmitter.removeAllListeners(["songData"])
                    vcm.terminateManager()
                  }else if(type == "error"){
                    message.channel.send({embeds: [new embedBase("Error",  `An error has occurred.\n\nPlease contact a developer with the following error message: \`\`\`${data}\`\`\``)]})
                    vcm.eventEmitter.removeAllListeners(["songData"])
                    vcm.terminateManager()
                  }
                })
              }
            }
          }else{
              message.channel.send({embeds: [new embedBase("Prompt Terminated", `${data.first().content} isn't a valid option.`)]})
          }
        }
      }).catch((err) => {
        console.log(err)
        message.channel.send({embeds: [new embedBase("Prompt Terminated", "The prompt ran out of time and has been terminated.")]})
      })
      */
      }
    }
  }
}
