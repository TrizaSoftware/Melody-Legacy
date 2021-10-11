const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const {VoiceConnectionManager, getVCManager} = require("../utils/voiceConnectionManager")
const voice = require("@discordjs/voice")
const fetch = require("node-fetch")
const yt = require("youtube-search-without-api-key")



module.exports = class Command extends commandBase{
    constructor(){
        super("play", "Music", ["p", "song"], "Plays Music", true, {name: "search_term", type: 3, description: "The song you want to play.", required: true})
    }
    async execute(type, message, args){
        if(type == "interaction"){
          // message.reply({embeds: [new embedBase("Test", "Test", [{name: "test", value: "test", inline: true}])]})
          let member = message.guild.members.cache.find(member => member.id == message.user.id)
          message.member = member
        }
        if(!message.member.voice.channel){
            message.reply({embeds: [new embedBase("Error", "You must be in a Voice Channel to run this command.")]})
        }else{
          let query
          if(args[0] && type == "chat"){
            query = args.join(" ")
          }else if(!args[0] && type == "chat"){
            message.reply({embeds: [new embedBase("Error", "You must specify a search term!")]})
          }else{
            query = args[0].value
          }
          let data = await yt.search(query)
          let fields = []
          let datatoindex = []
          for (let i = 0; i < 5; i++){
            let actualNumber = i + 1
            if(data[i]){
              fields[i] = {name: `${actualNumber.toString()}.`, value: data[i].title, inline: false}
              datatoindex[i] = {name: data[i].title, url: data[i].url}
            }
          }
          let embed = new embedBase("Pick a Song", "Please pick a song.", fields, "Type Cancel to Cancel | Prompt cancels in 1 minute")
          message.reply({embeds: [embed]})
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
                    vcm.eventEmitter.on("songData", (type, data) => {
                      if (type == "playing"){
                        message.channel.send({embeds: [new embedBase("Now Playing",  `Now Playing: [${data.name}](${data.url})`)]})
                      }else if(type == "end"){
                        message.channel.send({embeds: [new embedBase("Song Ended",  `The Song Has Ended.`)]})
                      }else if(type == "queueEnd"){
                        message.channel.send({embeds: [new embedBase("Queue Ended",  `The Queue Has Ended.`)]})
                        vcm.eventEmitter.removeAllListeners(["songData"])
                        vcm.terminateManager()
                      }else if(type == "error"){
                        message.channel.send({embeds: [new embedBase("Error",  `An error has occurred.`)]})
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
          if(!getVCManager(message.guild.id)){
            await voice.joinVoiceChannel({channelId: message.member.voice.channel.id, guildId: message.guild.id, adapterCreator: message.member.voice.channel.guild.voiceAdapterCreator})
            new VoiceConnectionManager(message.guild.id,message.member.voice.channel.id)
          }else if(getVCManager(message.guild.id).currentChannelId !== message.member.voice.channel.id){
            voice.joinVoiceChannel({channelId: message.member.voice.channel.id, guildId: message.guild.id, adapterCreator: message.member.voice.channel.guild.voiceAdapterCreator})
          }
        }
    }
}