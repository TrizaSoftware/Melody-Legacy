const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const Data = require("../index")

module.exports = class Command extends commandBase{
    constructor(){
        super("help","Information", ["h", "commands"], "Shows a list of commands.",true)
    }
    async execute(type, message, args){
      let categories = []
      for (let command of Data.Bot.commands){
        let actualcmddata = command[1]
        if (!categories[actualcmddata.category]){
          categories[actualcmddata.category] = {name: actualcmddata.category, value: `${process.env.PREFIX}${actualcmddata.name} → ${actualcmddata.desc} | Aliases: ${actualcmddata.aliases}`}
        }else{
          categories[actualcmddata.category].value += `\n${process.env.PREFIX}${actualcmddata.name} → ${actualcmddata.desc} | Aliases: ${actualcmddata.aliases}`
        }
      }
      let fields = []
      for (let data in categories){
        fields[fields.length] = categories[data]
      }
      message.reply({embeds: [new embedBase("Commands", undefined, fields)]})
    }
}