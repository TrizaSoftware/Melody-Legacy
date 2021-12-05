const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const {serverdata} = require("../../db")
const dataCache = require("../utils/dataCache")

module.exports = class Command extends commandBase{
    constructor(){
        super("announcementschannel", "Config", ["ac"], "Changes the server's announcement's channel.", true, 
    [{   
        name: "channel", 
        type: 7, 
        description: "What you want the announcements channel to be.", 
        required: true,
        channel_types: [0]
    }])
    }
    async execute(type, message, args){
        let servercache = dataCache.fetchServerCache(message.guild.id) 
        if(!message.member.permissions.has("MANAGE_GUILD")){
            setTimeout(function(){
             message.reply({embeds: [new embedBase("Error", `You must have the **Manage Server** permission.`)]})
            },1000)
            return;
        }
        servercache.updateData("announcementsChannel", args[0].channel.id)
        await serverdata.findOne({serverId: message.guild.id}).then(async result => {
            if(result){
                await serverdata.findOneAndUpdate({serverId: message.guild.id}, {announcementsChannel: args[0].channel.id})
            }else{
                await serverdata.create({serverId: message.guild.id, announcementsChannel: args[0].channel.id})
            }
            message.reply({embeds: [new embedBase("Success", `Successfully changed the announcements channel to <#${args[0].channel.id}>`)]})
        })

    }
}
