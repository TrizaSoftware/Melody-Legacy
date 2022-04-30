const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const dataCache = require("../utils/dataCache")

module.exports = class Command extends commandBase{
    constructor(){
        super("serverdata", "Information", ["sd"], "Gets the server data.", false)
    }
    async execute(message, args){
        let fields = []
        let data = dataCache.fetchServerCache(message.guild.id)
        if (data.data.musicLockEnabled !== undefined) {
          fields.push({ name: "Music Channel Enabled:", value: data.data.musicLockEnabled.toString() })
        }
        if (data.data.musicChannelId) {
          fields.push({ name: "Music Channel:", value: `<#${data.data.musicChannelId}>` })
        }
        if (data.data.djRoleEnabled !== undefined) {
          fields.push({ name: "DJ Role Enabled:", value: data.data.djRoleEnabled.toString() })
        }
        if (data.data.djRoleId) {
          fields.push({ name: "DJ Role:", value: `<@&${data.data.djRoleId}>` })
        }
        if (data.data.announcementsChannel) {
          fields.push({ name: "Announcements Channel:", value: `<#${data.data.announcementsChannel}>` })
        }
        message.reply({ embeds: [new embedBase("Server Data", "All of the data Melody has on this server is listed below.", fields)] })
    }
}