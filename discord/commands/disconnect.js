const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const {getVCManager} = require("../utils/voiceConnectionManager")
const {fetchServerCache} = require("../utils/dataCache")

module.exports = class Command extends commandBase{
    constructor(){
        super("disconnect", "Music", ["d", "dc"], "Disconnects the bot from the music channel.", false)
    }
    async execute(type, message, args){
        if(type == "interaction"){
            // message.reply({embeds: [new embedBase("Test", "Test", [{name: "test", value: "test", inline: true}])]})
            let member = message.guild.members.cache.find(member => member.id == message.user.id)
            message.member = member
        }
      const vcm = getVCManager(message.guild.id)
      let datacache = fetchServerCache(message.guild.id)
      if(datacache.data.djRoleEnabled && !message.member.roles.cache.has(datacache.data.djRoleId)){
          message.reply({embeds: [new embedBase("Error", "You must have the DJ role to run this command.")]})
          return;
      }
      if(!vcm){
        message.reply({embeds: [new embedBase("Error", "Bot is not in a voice channel.")]})
      }else{
          vcm.terminateManager()
          message.reply({embeds: [new embedBase("Success", "Successfully Disconnected The Bot. :mailbox:")]})
      }
    }
}