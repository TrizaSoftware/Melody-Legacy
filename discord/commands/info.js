const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const {getVCManager} = require("../utils/voiceConnectionManager")

module.exports = class Command extends commandBase{
    constructor(){
        super("info", "Information", ["i", "information", "botdata"], "Shows all information for Melody.", true)
    }
    async execute(type, message, args){
      if(!getVCManager(message.guild.id)){
        message.reply({embeds: [new embedBase("Error", "No Voice Manager data to show.")]})
      }else{
      let data = getVCManager(message.guild.id)
       message.reply({embeds: [new embedBase("Voice Manager Info", "Current Voice Manager Information", [{name: "Current Channel:", value: `<#${data.currentChannelId}>`, inline: true},{name: "Looping:", value: data.shouldLoop.toString(), inline: true}])]})
      }
    }
}