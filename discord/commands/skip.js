const commandBase = require("../utils/commandBase")
const {getVCManager} = require("../utils/voiceConnectionManager")
const embedBase = require("../utils/embedBase")

module.exports = class Command extends commandBase{
    constructor(){
        super("skip", "Music", ["s"], "Skips the song.", false)
    }
    async execute(type, message, args){
        if(type == "interaction"){
            // message.reply({embeds: [new embedBase("Test", "Test", [{name: "test", value: "test", inline: true}])]})
            let member = message.guild.members.cache.find(member => member.id == message.user.id)
            message.member = member
          }
        if(getVCManager(message.guild.id) && getVCManager(message.guild.id).currentChannelId == message.member.voice.channel.id && getVCManager(message.guild.id).queue[0] !== undefined){
            let vcm = getVCManager(message.guild.id)
            message.reply({embeds: [new embedBase("Skipped", "Successfully skipped the song.")]})
            vcm.shouldLoop = false
            vcm.audioPlayer.stop()
        }else{
            message.reply({embeds: [new embedBase("Error", "You can't do that right now.")]})
        }
    }
}