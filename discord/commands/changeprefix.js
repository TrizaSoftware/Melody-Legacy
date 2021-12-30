const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const {serverdata} = require("../../db")
const dataCache = require("../utils/dataCache")

module.exports = class Command extends commandBase{
    constructor(){
        super("changeprefix", "Config", ["cp"], "Changes the server's prefix.", false, 
    [{   
        name: "prefix", 
        type: 3, 
        description: "What you want the new prefix of your server to be.", 
        required: true
    }])
    }
    async execute(type, message, args){
        if (type == "interaction"){
            message.deferReply()
        }else{
            message.react("<a:loading:740018948522901515>")
        }
        if(!message.member.permissions.has("MANAGE_GUILD")){
            setTimeout(function(){
              if (type == "interaction"){
                message.editReply({embeds: [new embedBase("Error", `You must have the **Manage Server** permission.`)]})
              }else{
                 message.reply({embeds: [new embedBase("Error", `You must have the **Manage Server** permission.`)]})
                 message.reactions.removeAll()
                .catch(error => console.log('Failed to clear reactions:', error));
              } 
            },1000)
            return;
        }
        if(!args[0]){
            message.reply({embeds:[new embedBase("Error", "You must specify a prefix.")]})
            return;
        }
        let newprefix = args[0].value || args[0]
        if(dataCache.fetchServerCache(message.guild.id) && newprefix == dataCache.fetchServerCache(message.guild.id).data.prefix){
            setTimeout(function(){
                if (type == "interaction"){
                    message.editReply({embeds: [new embedBase("Error", `That's already the prefix.`)]})
                }else{
                    message.reply({embeds: [new embedBase("Error", `That's already the prefix.`)]})
                    message.reactions.removeAll()
                    .catch(error => console.log('Failed to clear reactions:', error));
                }
            },1000)
            return;
        }
        setTimeout(function(){
            serverdata.findOne({serverId: message.guild.id}).then(async result => {
                try{
                    if(!result){
                        serverdata.create({serverId: message.guild.id, prefix: newprefix})
                        new dataCache.serverCache(message.guild.id, {prefix: newprefix})
                    }else{
                       await serverdata.findOneAndUpdate({serverId: message.guild.id}, {prefix: newprefix}, {new: true})
                       dataCache.fetchServerCache(message.guild.id).updateData("prefix", newprefix)
                    }
                    if (type == "interaction"){
                        message.editReply({embeds: [new embedBase("Success", `Successfully changed the prefix to **${newprefix}**`)]})
                    }else{
                        message.reply({embeds: [new embedBase("Success", `Successfully changed the prefix to **${newprefix}**`)]})
                        message.reactions.removeAll()
                        .catch(error => console.log('Failed to clear reactions:', error));
                    }
                }catch(err){
                    console.log(err)
                    if (type == "interaction"){
                        message.editReply({embeds: [new embedBase("Error", `An Error Occurred While Changing The Prefix`)]})
                    }else{
                        message.reply({embeds: [new embedBase("Error", `An Error Occurred While Changing The Prefix`)]})
                        message.reactions.removeAll()
                        .catch(error => console.log('Failed to clear reactions:', error));
                    }
                }
            })
        },1500)
    }
}
