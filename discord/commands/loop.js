const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const {getVCManager} = require("../utils/voiceConnectionManager")


module.exports = class Command extends commandBase{
    constructor(){
        super("loop", "Music", ["l", "repeat"], "Repeats the current song.", false)
    }
    async execute(type, message, args){
       if(type == "interaction"){
            let member = message.guild.members.cache.find(member => member.id == message.user.id)
            message.member = member
        }
        if(getVCManager(message.guild.id) && message.member.voice.channel && getVCManager(message.guild.id).currentChannelId == message.member.voice.channel.id && getVCManager(message.guild.id).queue[0] !== undefined){
            let vcm = getVCManager(message.guild.id)
            vcm.shouldLoop = !vcm.shouldLoop
            if (vcm.shouldLoop == true){
              message.reply({embeds: [new embedBase(`Now Looping`, `${vcm.queue[0].name} is now looping. 🔁`)]})
            }else{
              message.reply({embeds: [new embedBase(`No Longer Looping`, `${vcm.queue[0].name} is no longer looping.`)]})
            }
        }else{
            message.reply({embeds: [new embedBase("Error", "You can't do that right now.")]})
        }
    }
}