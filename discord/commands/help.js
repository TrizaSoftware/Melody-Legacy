const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const Data = require("../index")
const {serverdata} = require("../../db")

module.exports = class Command extends commandBase{
    constructor(){
        super("help","Information", ["h", "commands"], "Shows a list of commands.",false)
    }
    async execute(type, message, args){
      let categories = []
      let prefix = process.env.PREFIX
      serverdata.findOne({serverId:message.guild.id}).then(result => {
        if(result){
          prefix = result.prefix
        }
        for (let command of Data.Bot.commands){
          let actualcmddata = command[1]
           if (!categories[actualcmddata.category]){
             if (actualcmddata.slashonly){
              categories[actualcmddata.category] = {name: actualcmddata.category, value: `/${actualcmddata.name} → ${actualcmddata.desc} | Aliases: ${actualcmddata.aliases}`}
             }else{
              categories[actualcmddata.category] = {name: actualcmddata.category, value: `${prefix}${actualcmddata.name} → ${actualcmddata.desc} | Aliases: ${actualcmddata.aliases}`}
             }
           }else{
            if (actualcmddata.slashonly){
              categories[actualcmddata.category].value += `\n/${actualcmddata.name} → ${actualcmddata.desc} | Aliases: ${actualcmddata.aliases}`
            }else{
              categories[actualcmddata.category].value += `\n${prefix}${actualcmddata.name} → ${actualcmddata.desc} | Aliases: ${actualcmddata.aliases}`
            }
           }
        }
        let fields = []
        for (let data in categories){
          fields[fields.length] = categories[data]
        }
        message.reply({embeds: [new embedBase("Commands", undefined, fields)]})
      })
    }
}