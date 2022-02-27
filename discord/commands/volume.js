const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const bot = require("..")
const dataCache = require("../utils/dataCache")
const {getVCManager} = require("../utils/voiceConnectionManager")
module.exports = class Command extends commandBase{
    constructor(){
        super("volume", "Music", ["vol"], "Changes the volume of the music.", true,  [{name: "volume", type: 4, required: true, description:"The percent of the volume of the song."}])
    }
    async execute(message, args){
        const vcm = getVCManager(message.guild.id)
        let volume = parseInt(args[0].value)
        if(!vcm || !vcm.queue[0] ){
            message.reply({embeds: [new embedBase("Error", "You can't do that right now.")]})
            return
        }
        if(volume > 100){
            message.reply({embeds: [new embedBase("Error", "The volume can only be a max of 100%.")]})
        }else{
            vcm.changeVolume(volume/100)
            message.reply({embeds: [new embedBase("Success",`The volume has been set to ${volume}%.`)]})
        }
    }
}