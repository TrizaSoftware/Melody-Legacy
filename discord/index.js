const {Client, Intents} = require("discord.js")
const botIntents = new Intents()
botIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES)

let botClient = new Client({intents: botIntents})

botClient.on("messageCreate", (message) => {
    if (!message.author.bot){
        message.reply("test")
    }
})



botClient.login(process.env.TOKEN)