const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const bot = require("..")
const dataCache = require("../utils/dataCache")
const {getVCManager} = require("../utils/voiceConnectionManager")
module.exports = class Command extends commandBase{
    constructor(){
        super("pause", "Music", ["paus"], "Pause or unpause the music currently playing.", true,  [{name: "pause", type: 3, choices: [{name: "On", value:"on"}, {name: "Off", value: "off"}], required: true, description:"Whether you want the music to be paused."}])
    }
    async execute(message, args){
        const vcm = getVCManager(message.guild.id)
        let pause = args[0].value
        if(!vcm || !vcm.queue[0]){
            message.reply({embeds: [new embedBase("Error", "You can't do that right now.")]})
            return
        }
        if(pause == "on"){
            message.reply({embeds: [new embedBase("Success", "The music is now paused. ⏸️")]})
            vcm.audioPlayer.pause()
        }else{
            message.reply({embeds: [new embedBase("Success", "The music is now playing. ▶️")]})
            vcm.audioPlayer.unpause()
        }
    }
}