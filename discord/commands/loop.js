const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const {getVCManager} = require("../utils/voiceConnectionManager")


module.exports = class Command extends commandBase{
    constructor(){
        super("loop", "Music", ["l", "repeat"], "Repeats the current song.", false, [{name: "loop_type", type: 3, choices: [{name: "Song", value:"song"}, {name: "Queue", value: "queue"}, {name: "Stop", value: "stop"}], required: false, description:"The type of loop you want the bot to have."}])
    }
    async execute(message, args){
        let vcm = getVCManager(message.guild.id)
        if(!vcm){
            message.reply({embeds: [new embedBase("Error", "The bot isn't in a voice channel.")]})
            return
        }
        let looptype
        if(args[0]){
            looptype = args[0].value|| args[0].toLowerCase()
        }else{
            if(vcm.loopType){
                looptype = "stop"
            }else{
                looptype = "song"
            }
        }
        if (looptype !== "queue" && looptype !== "song" && looptype == !"stop"){
            message.reply({embeds: [new embedBase("Invalid Loop Type", `You can only say "song", "queue", or "stop".`)]})
            return
        }
        if(message.member.voice.channel && vcm.currentChannelId == message.member.voice.channel.id && vcm.queue[0] !== undefined){
            if(looptype == "stop"){
                if(!vcm.loopType){
                    message.reply({embeds: [new embedBase("Error", "Nothing is looping.")]})
                }else{
                    message.reply({embeds: [new embedBase("No Longer Looping", `The ${vcm.loopType} is no longer looping.`)]})
                    vcm.loopType = undefined
                }
            }else{
                message.reply({embeds: [new embedBase("Now Looping", `The ${looptype} is now looping. 🔁`)]})
                vcm.loopType = looptype
            }
            /*
            if (vcm.shouldLoop){
              message.reply({embeds: [new embedBase(`Now Looping`, `${vcm.queue[0].name} is now looping. 🔁`)]})
            }else{
              message.reply({embeds: [new embedBase(`No Longer Looping`, `${vcm.queue[0].name} is no longer looping.`)]})
            }
            */
        }else{
            message.reply({embeds: [new embedBase("Error", "You can't do that right now.")]})
        }
    }
}