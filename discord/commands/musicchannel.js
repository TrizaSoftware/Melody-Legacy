const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const dataCache = require("../utils/dataCache")
const {serverdata} = require("../../db")

function saveData(guildid, enabled, channelid){
    if (channelid){
        dataCache.fetchServerCache(guildid).updateData("musicLockEnabled", enabled)
        dataCache.fetchServerCache(guildid).updateData("musicChannelId", channelid)
        serverdata.findOne({serverId: guildid}).then(async result => {
            if (result){
                await serverdata.findOneAndUpdate({serverId: guildid}, {musicLockEnabled: enabled, musicChannelId: channelid})
            }else{
                serverdata.create({serverId: guildid, musicLockEnabled: enabled, musicChannelId: channelid})
            }
        })
    }else{
        dataCache.fetchServerCache(guildid).updateData("musicLockEnabled", enabled)
        serverdata.findOne({serverId: guildid}).then(async result => {
            if (result){
                await serverdata.findOneAndUpdate({serverId: guildid}, {musicLockEnabled: enabled})
            }else{
                serverdata.create({serverId: guildid, musicLockEnabled: enabled})
            }
        })
    }
}


module.exports = class Command extends commandBase{
    constructor(){
        super("musicchannel", "Config", ["mc"], "Lets you change the channel music should be played in.", true, [    {   
            name: "enabled", 
            type: 5, 
            description: "Whether or not you want this feature enabled.", 
            required: true
        }, {
            name: "channel",
            type: 7,
            description: "What channel you want the bot to be bound to.",
            required: false,
            channel_types: [2]
        }])
    }
    async execute(message, args){
        message.deferReply()
        const enabled = args[0].value
        const channel = args[1]
        setTimeout(function(){
        if(!message.member.permissions.has("MANAGE_GUILD")){
            message.editReply({embeds: [new embedBase("Error", `You must have the **Manage Server** permission.`)]})
            return;
        }
        if(enabled && !channel){
            message.editReply({embeds: [new embedBase("Error", `You must specify a channel.`)]})
        }else if(!enabled){
            if(channel){
                if(channel.channel.type !== "GUILD_VOICE"){
                    message.editReply({embeds: [new embedBase("Error", `The selected channel must be a voice channel.`)]})
                }else{
                   saveData(message.guild.id, enabled, channel.value)
                   message.editReply({embeds: [new embedBase("Success", "Successfully Saved Settings.")]})
                }
            }else{
                saveData(message.guild.id, enabled)
                message.editReply({embeds: [new embedBase("Success", "Successfully Saved Settings.")]})
            }
        }else{
            if(channel.channel.type !== "GUILD_VOICE"){
                message.editReply({embeds: [new embedBase("Error", `The selected channel must be a voice channel.`)]})
            }else{
                saveData(message.guild.id, enabled, channel.value)
                message.editReply({embeds: [new embedBase("Success", "Successfully Saved Settings.")]})
            }
        }
    },1500)
    }
}
