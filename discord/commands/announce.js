const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const bot = require("..")
const dataCache = require("../utils/dataCache")
module.exports = class Command extends commandBase {
    constructor() {
        super("announce", "Staff", ["a"], "Announces a message to all servers.", true, [{ name: "message", required: true, type: 3, description: "What you want to announce." }], true)
    }
    async execute(type, message, args) {
        if (message.member.permissions.has("ADMINISTRATOR")) {
            let msg = args[0].value
            message.reply({ embeds: [new embedBase("Announce", `Announcing Message "${msg}" to ${bot.Bot.guilds.cache.size} servers.`)] })
            message.channel.send({ embeds: [new embedBase("Announce", undefined, [{ name: "Servers Notified:", value: "0" }])] }).then(m => {
                let messagessent = []
                function dst() {
                    let passed = 0
                    for (let item in messagessent) {
                        if (messagessent[item].sentmessage == true) {
                            passed += 1
                        }
                    }
                    return passed
                }
                function attemptedservers() {
                    let checked = 0
                    for (let item in messagessent) {
                        if (messagessent[item].attemptedmessage == true) {
                            checked += 1
                        }
                    }
                    return checked
                }
                function findchannel(guild) {
                    let selectedchannel = undefined
                    if (dataCache.fetchServerCache(guild.id).data.announcementsChannel) {
                        selectedchannel = guild.channels.cache.find(channel => channel.id == dataCache.fetchServerCache(guild.id).data.announcementsChannel)
                        return selectedchannel
                    }
                    for (let channel of guild.channels.cache) {
                        if (channel[1].name.includes("general") && channel[1].type == "GUILD_TEXT") {
                            selectedchannel = channel[1]
                        }
                    }
                    if (!selectedchannel) {
                        selectedchannel = guild.channels.cache.find(channel => channel.type == "GUILD_TEXT")
                    }

                    return selectedchannel
                }
                function shortenservername(name) {
                    if (name.len > 20) {
                        return `${name.substr(0, 20)}...`
                    } else {
                        return name
                    }
                }
                function notifyuser() {
                    if (attemptedservers() == bot.Bot.guilds.cache.size) {
                        let fields = []
                        for (let serverid in messagessent) {
                            let guild = bot.Bot.guilds.cache.find(guild => guild.id == serverid)
                            if (messagessent[serverid].sentmessage == true) {
                                fields.push({ name: `${shortenservername(guild.name)}:`, value: `✅ | <#${findchannel(guild).id}>` })
                            } else {
                                fields.push({ name: `${shortenservername(guild.name)}:`, value: `❌ | <#${findchannel(guild).id}>` })
                            }
                        }
                        message.user.send({ embeds: [new embedBase("Announce Results", undefined, fields)] })
                    }
                }
                for (let guild of bot.Bot.guilds.cache) {
                    let ag = guild[1]
                    let channel = findchannel(ag)
                    messagessent[ag.id] = { sentmessage: false, attemptedmessage: false }
                    channel.send({ embeds: [new embedBase("Melody Announcement", msg, [{ name: "Posted By:", value: `${message.user.username}#${message.user.discriminator}` }])] }).then(() => {
                        messagessent[ag.id].sentmessage = true
                        messagessent[ag.id].attemptedmessage = true
                        m.edit({ embeds: [new embedBase("Announce", undefined, [{ name: "Servers Notified:", value: dst().toString() }, { name: "Percent Complete:", value: `${Math.floor((dst() / bot.Bot.guilds.cache.size) * 100)}%` }])] })
                        notifyuser()
                    }).catch((err) => {
                        messagessent[ag.id].attemptedmessage = true
                        console.log(err)
                        console.log(`An error occurred while notifying server: ${ag.id}`)
                        notifyuser()
                    })
                }

            })
        } else {
            message.reply({ ephemeral: true, content: "You can't run the announce command." })
        }
    }
}
