const commandBase = require("../utils/commandBase")
const {getVCManager} = require("../utils/voiceConnectionManager")
const embedBase = require("../utils/embedBase")
const {fetchServerCache} = require("../utils/dataCache")

module.exports = class Command extends commandBase{
    constructor(){
        super("skip", "Music", ["s"], "Skips the song.", false)
    }
    async execute(message, args){
            // message.reply({embeds: [new embedBase("Test", "Test", [{name: "test", value: "test", inline: true}])]})
        let member = message.guild.members.cache.find(member => member.id == message.user.id)
        message.member = member
        let datacache = fetchServerCache(message.guild.id)
        let vcm = getVCManager(message.guild.id)
        if(datacache.data.djRoleEnabled && !message.member.roles.cache.has(datacache.data.djRoleId)){
            message.reply({embeds: [new embedBase("Error", "You must have the DJ role to run this command.")]})
            return;
        }
        if(vcm && vcm.currentChannelId == message.member.voice.channel.id && vcm.queue[0] !== undefined){
            message.reply({embeds: [new embedBase("Skipped", "Successfully skipped the song.")]})
            vcm.shouldLoop = false
            vcm.audioPlayer.stop()
        }else{
            message.reply({embeds: [new embedBase("Error", "You can't do that right now.")]})
        }
    }
}