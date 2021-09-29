const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const {VoiceConnectionManager} = require("../utils/voiceConnectionManager")
const voice = require("@discordjs/voice")


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
         voice.joinVoiceChannel({channelId: message.member.voice.channel.id, guildId: message.guild.id, adapterCreator: message.member.voice.channel.guild.voiceAdapterCreator})
         new voiceConnectionManager(message.member.voice.channel.id).eventEmitter.on("dataSend", (data) => {
           console.log(data)
         })
        }
        let vcm = new VoiceConnectionManager(message.member.voice.channel.id)
        vcm.eventEmitter.on("test", (data)=> {
          console.log("test")
        })
    }
}