const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const {getVCManager} = require("../utils/voiceConnectionManager")

module.exports = class Command extends commandBase{
    constructor(){
        super("queue", "Music", ["q"], "Shows the queue for music.", true)
    }
    async execute(type, message, args){
      if(!getVCManager(message.guild.id)){
        message.reply({embeds: [new embedBase("Error", "Bot is not in a voice channel.")]})
      }else{
        let queue = getVCManager(message.guild.id).queue
        if(queue.length == 0){
          message.reply({embeds: [new embedBase("No Queue", "No queue data to show.")]})
        }else{
          let fields = []
            for (let i = 0; i < queue.length; i++){
              if(i == 0){
                fields[0] = {name: "Now Playing:", value:`[${queue[i].name}](${queue[i].url})`}
              }else{
                 fields[fields.length] = {name: `${i}.`, value:`[${queue[i].name}](${queue[i].url})`}
              }
            }
          message.reply({embeds:[new embedBase("Queue", undefined, fields)]})
        }
      }
    }
}