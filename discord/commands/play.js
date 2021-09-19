const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")


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
         let channel = message.guild.channels.cache.find(channel => channel.id == message.member.voice.channel.id)
         console.log(channel)
        }
    }
}