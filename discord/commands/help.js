const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const Data = require("..")
const dataCache = require("../utils/dataCache")

module.exports = class Command extends commandBase{
    constructor(){
        super("help","Information", ["h", "commands"], "Shows a list of commands.",false)
    }
    async execute(message, args){
      let categories = []
      let prefix = process.env.PREFIX
      if(dataCache.fetchServerCache(message.guild.id) && dataCache.fetchServerCache(message.guild.id).data.prefix){
        prefix = dataCache.fetchServerCache(message.guild.id).data.prefix
      }
        for (let command of Data.Bot.commands){
          let actualcmddata = command[1]
           if (!categories[actualcmddata.category]){
              categories[actualcmddata.category] = {name: actualcmddata.category, value: `/${actualcmddata.name} → ${actualcmddata.desc}`}
           }else{
              categories[actualcmddata.category].value += `\n/${actualcmddata.name} → ${actualcmddata.desc}`
           }
        }
        let fields = []
        for (let data in categories){
          fields[fields.length] = categories[data]
        }
        message.reply({embeds: [new embedBase("Commands", undefined, fields)]})
    }
}