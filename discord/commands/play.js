const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const componentBase = require("../utils/componentBase")
const { VoiceConnectionManager, getVCManager } = require("../utils/voiceConnectionManager")
const voice = require("@discordjs/voice")
const usetube = require("usetube")
let dataCache = require("../utils/dataCache")



module.exports = class Command extends commandBase {
  constructor() {
    super("play", "Music", ["p", "song"], "Plays Music", false, [{ name: "search_term", type: 3, description: "The song you want to play.", required: true }])
  }
  async execute(type, message, args) {
    if (type == "interaction") {
      // message.reply({embeds: [new embedBase("Test", "Test", [{name: "test", value: "test", inline: true}])]})
      let member = message.guild.members.cache.find(member => member.id == message.user.id)
      message.member = member
      message.deferReply()
    } else {
      message.react("<a:loading:740018948522901515>")
    }
    if (!message.member.voice.channel) {
      if (type == "interaction") {
        setTimeout(function () {
          message.editReply({ embeds: [new embedBase("Error", "You must be in a Voice Channel to run this command.")] })
        }, 1000)
      } else {
        message.reply({ embeds: [new embedBase("Error", "You must be in a Voice Channel to run this command.")] })
      }
    } else {
      let serverdata = dataCache.fetchServerCache(message.guild.id)
      if (serverdata && serverdata.data.musicLockEnabled && serverdata.data.musicChannelId !== message.member.voice.channel.id) {
        setTimeout(function () {
          if (type == "interaction") {
            message.editReply({ embeds: [new embedBase("Error", "You must be in the music channel to play songs.")] })
          } else {
            message.reply({ embeds: [new embedBase("Error", "You must be in the music channel to play songs.")] })
          }
        }, 1000)
        return;
      }
      let query
      if (args[0] && type == "chat") {
        query = args.join(" ")
      } else if (!args[0] && type == "chat") {
        message.reply({ embeds: [new embedBase("Error", "You must specify a search term!")] })
        return
      } else {
        query = args[0].value
      }
      let data = await usetube.searchVideo(query)
      let fields = []
      let datatoindex = []
      let componentData = []
      if (data && data.videos[0]) {
        for (let i = 0; i < 5; i++) {
          let actualNumber = i + 1
          if (data.videos[i]) {
            fields[i] = { name: `${actualNumber.toString()}.`, value: data.videos[i].original_title, inline: false }
            datatoindex[i] = { name: data.videos[i].original_title, url: `https://youtube.com/watch?v=${data.videos[i].id}` }
            componentData[i] = { style: "SUCCESS", text: actualNumber.toString() }
          }
        }
      } else {
        if (type == "interaction") {
          message.editReply({ embeds: [new embedBase("Error", "No Results.")] })
        } else {
          message.reply({ embeds: [new embedBase("Error", "No Results.")] })
        }
        return
      }
      let embed = new embedBase("Pick a Song", "Please pick a song.", fields, "Prompt cancels in 1 minute")
      let components = new componentBase("button", componentData)
      let botMsg = undefined
      if (type == "interaction") {
        setTimeout(function () {
          message.editReply({ embeds: [embed], components: [components, new componentBase("button", [{ text: "Cancel", style: "DANGER" }])] })
        }, 1000)
      } else {
        message.reply({ embeds: [embed], components: [components, new componentBase("button", [{ text: "Cancel", style: "DANGER" }])] }).then(msg => {
          botMsg = msg
        })
        message.reactions.removeAll()
          .catch(error => console.log('Failed to clear reactions:', error));
      }

      const collector = message.channel.createMessageComponentCollector({ componentType: 'BUTTON', time: 60000 });

      collector.on("collect", i => {
        if (i.user.id == message.member.id) {
          collector.stop()
          i.deferReply()
          if (i.customId == "Cancel") {
            setTimeout(function () {
              i.editReply({ embeds: [new embedBase("Prompt Cancelled", "The prompt has been successfully cancelled.")] })
            }, 500)
            return;
          }
          let selectedoption = datatoindex[parseInt(i.customId) - 1]
          let vcm = getVCManager(message.guild.id)
          if (getVCManager(message.guild.id)) {
            vcm.addToQueue(selectedoption)
            setTimeout(function () {
              i.editReply({ embeds: [new embedBase("Added To Queue", `Added [${selectedoption.name}](${selectedoption.url}) to the queue!`)] })
            }, 500)
            if (vcm.eventEmitter._eventsCount == 0) {
              vcm.eventEmitter.on("songData", (type, data) => {
                if (type == "playing") {
                  if (vcm.shouldLoop) { return; }
                  message.channel.send({ embeds: [new embedBase("Now Playing", `Now Playing: [${data.name}](${data.url})`)] })
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
                }
              })
            }
          }
        } else {
          i.reply({ content: "You can't click these buttons.", ephemeral: true })
        }
      })

      collector.on("end", () => {
        if (type == "interaction") {
          message.editReply({ embeds: [embed], components: [] })
        } else {
          botMsg.edit({ embeds: [embed], components: [] })
        }
      })
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
      try {
        if (!getVCManager(message.guild.id)) {
          await voice.joinVoiceChannel({ channelId: message.member.voice.channel.id, guildId: message.guild.id, adapterCreator: message.member.voice.channel.guild.voiceAdapterCreator })
          new VoiceConnectionManager(message.guild.id, message.member.voice.channel.id)
        } else if (getVCManager(message.guild.id).currentChannelId !== message.member.voice.channel.id) {
          voice.joinVoiceChannel({ channelId: message.member.voice.channel.id, guildId: message.guild.id, adapterCreator: message.member.voice.channel.guild.voiceAdapterCreator })
        }
      } catch (err) {
        message.channel.send({ content: "An Error Has Occurred: I can't join the voice channel." })
      }
    }
  }
}