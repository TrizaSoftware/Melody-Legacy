const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const {getVCManager} = require("../utils/voiceConnectionManager")
const bot = require("..")

module.exports = class Command extends commandBase{
    constructor(){
        super("announce", "Staff", ["a"], "Announces a message to all servers.", true, [{name: "message", required: true, type: 3, description: "What you want to announce."}], true)
    }
    async execute(type, message, args){
        if(message.member.permissions.has("ADMINISTRATOR")){
            let msg = args[0].value
            message.reply({embeds: [new embedBase("Announce", `Announcing Message "${msg}" to ${bot.Bot.guilds.cache.size} servers.`)]})
            message.channel.send({embeds: [new embedBase("Announce", undefined, [{name: "Servers Notified:", value: "0"}])]}).then(m => {
               let messagessent = []
               function dst(){
                   let passed = 0
                   for(let item in messagessent){
                       if(messagessent[item] == true){
                           passed += 1
                       }
                   }
                   return passed
               }
               function serverschecked(){
                let checked = 0
                for(let item in messagessent){
                    checked += 1
                }
                return checked
               }
               function findchannel(guild){
                for (let channel of guild.channels.cache){
                    if (channel[1].name.includes("general") && channel[1].type == "GUILD_TEXT"){
                        return channel
                    }else{
                        return guild.channels.cache.find(channel => channel.type == "GUILD_TEXT")
                    }
                }  
               }
               for (let guild of bot.Bot.guilds.cache){
                    let ag = guild[1]
                    let channel = findchannel(ag)
                    messagessent[ag.id] = false
                    try{
                        channel.send({embeds: [new embedBase("Melody Announcement", msg, [{name: "Posted By:", value: `${message.user.username}#${message.user.discriminator}`}])]}).then(() => {
                           m.edit({embeds: [new embedBase("Announce", undefined, [{name: "Servers Notified:", value: dst().toString()}])]})
                        })
                        messagessent[ag.id] = true
                        if(serverschecked() == bot.Bot.guilds.cache.size){
                            let fields = []
                            for (let serverid in messagessent){
                                if (messagessent[serverid] == true){
                                    fields.push({name: `Guild ${serverid}:`, value: "✅"})
                                }else{
                                    fields.push({name: `Guild ${serverid}:`, value: "❌"})
                                }
                            }
                            message.user.send({embeds:[new embedBase("Announce Results", undefined, fields)]})
                        }
                    }catch(err){
                        console.log(err)
                        console.log(`An error occurred while notifying server: ${ag.id}`)
                    }
                }
               
            })
        }else{
            message.reply({ephemeral: true, content: "You can't run the announce command."})
        }
    }
}