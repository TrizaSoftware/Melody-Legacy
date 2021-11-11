const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const dataCache = require("../utils/dataCache")
const {serverdata} = require("../../db")

function saveData(guildid, enabled, roleid){
    if (roleid){
        dataCache.fetchServerCache(guildid).updateData("djRoleEnabled", enabled)
        dataCache.fetchServerCache(guildid).updateData("djRoleId", roleid)
        serverdata.findOne({serverId: guildid}).then(async result => {
            if (result){
                await serverdata.findOneAndUpdate({serverId: guildid}, {djRoleEnabled: enabled, djRoleId: roleid})
            }else{
                serverdata.create({serverId: guildid, djRoleEnabled: enabled, djRoleId: roleid})
            }
        })
    }else{
        dataCache.fetchServerCache(guildid).updateData("djRoleEnabled", enabled)
        serverdata.findOne({serverId: guildid}).then(async result => {
            if (result){
                await serverdata.findOneAndUpdate({serverId: guildid}, {djRoleEnabled: enabled})
            }else{
                serverdata.create({serverId: guildid, djRoleEnabled: enabled})
            }
        })
    }
}


module.exports = class Command extends commandBase{
    constructor(){
        super("djrole", "Config", ["dj"], "Lets you select a DJ role to limit certain commands to some users.", true, [    {   
            name: "enabled", 
            type: 5, 
            description: "Whether or not you want this feature enabled.", 
            required: true
        }, {
            name: "role",
            type: 8,
            description: "What role you want DJ permissions to be bound to.",
            required: false
        }])
    }
    async execute(type, message, args){
        message.deferReply()
        const enabled = args[0].value
        const role = args[1]
        setTimeout(function(){
        if(!message.member.permissions.has("MANAGE_GUILD")){
            message.editReply({embeds: [new embedBase("Error", `You must have the **Manage Server** permission.`)]})
            return;
        }
        if(enabled && !role){
            message.editReply({embeds: [new embedBase("Error", `You must specify a role.`)]})
        }else if(!enabled){
            if(role){
                saveData(message.guild.id, enabled, role.value)
                message.editReply({embeds: [new embedBase("Success", "Successfully Saved Settings.")]})
            }else{
               saveData(message.guild.id, enabled)
                message.editReply({embeds: [new embedBase("Success", "Successfully Saved Settings.")]})
            }
        }else{  
            saveData(message.guild.id, enabled, role.value)
            message.editReply({embeds: [new embedBase("Success", "Successfully Saved Settings.")]})
        }
    },1000)
    }
}