const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const {getVCManager} = require("../utils/voiceConnectionManager")

module.exports = class Command extends commandBase{
    constructor(){
        super("queue", "Music", ["q"], "Shows the queue for music.", false)
    }
    async execute(type, message, args){
      if(!getVCManager(message.guild.id)){
        message.reply({embeds: [new embedBase("Error", "Bot is not in a voice channel.")]})
      }else{
        let vcm = getVCManager(message.guild.id)
        if(vcm.queue.length == 0){
          message.reply({embeds: [new embedBase("No Queue", "No queue data to show.")]})
        }else{
          let fields = []
          if (vcm.loopType == "queue" || vcm.currentSongId > 0){
            fields[0] = {name: `Now Playing:`, value: `Song ${vcm.currentSongId + 1}`}
            for (let i = 0; i < vcm.queue.length; i++){
              if(i == vcm.currentSongId){
                 fields[fields.length] = {name: `${i + 1}.`, value:`[${vcm.queue[i].name}](${vcm.queue[i].url}) (Now Playing)`}
              }else{
                 fields[fields.length] = {name: `${i + 1}.`, value:`[${vcm.queue[i].name}](${vcm.queue[i].url})`}
              }
            }
          }else{
            for (let i = 0; i < vcm.queue.length; i++){
              if(i == 0){
                 fields[0] = {name: "Now Playing:", value:`[${vcm.queue[i].name}](${vcm.queue[i].url})`}
              }else{
                 fields[fields.length] = {name: `${i}.`, value:`[${vcm.queue[i].name}](${vcm.queue[i].url})`}
              }
            }
          }
          message.reply({embeds:[new embedBase("Queue", undefined, fields)]})
        }
      }
    }
}