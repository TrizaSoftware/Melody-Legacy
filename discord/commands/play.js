const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")

module.exports = class Command extends commandBase{
    constructor(){
        super("play", "Music", ["p", "song"], "Plays Music", true, {name: "query", type: 3, description: "The song you want to play.", required: true})
    }
    async execute(type, message, args){
        if(type == "interaction"){
          // message.reply({embeds: [new embedBase("Test", "Test", [{name: "test", value: "test", inline: true}])]})
          let member = message.guild.members.cache.find(member => member.id == message.user.id)
          message.member = member
        }
        if(!message.member.voice.channel){
            message.reply({embeds: [new embedBase("Error", "You must be in a Voice Channel to run this command.")]})
          }
    }
}