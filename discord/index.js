const {Client, Intents, Collection} = require("discord.js")
const {REST} = require("@discordjs/")
const fs = require("fs")
const botIntents = new Intents()
botIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES)

let botClient = new Client({intents: botIntents})

botClient.commands = new Collection()
botClient.aliases = new Collection()

const cmdFiles = fs.readdirSync("discord/commands").filter((file) => (file.endsWith(".js")))

cmdFiles.forEach((file) => {
    const module = require(`./commands/${file}`)
    const command = new module()
    botClient.commands.set(command.name, command)
    command.aliases.forEach((alias) => {
        botClient.aliases.set(alias, command.name)
    })
})

botClient.on("interactionCreate", (interaction) => {
    if (!interaction.isCommand()){
        return;
    }
    interaction.reply("Test")
})


botClient.on("ready", () => {

    const commands = botClient.application.commands

    for(let cmd of botClient.commands){
        if(cmd[1].slash){
            console.log(cmd[1].name)
            for (let guild of botClient.guilds.cache){
                guild[1].commands.create({
                    name: cmd[1].name,
                    description: cmd[1].desc
                })
            }
            commands.create({
                name: cmd[1].name,
                description: cmd[1].desc
            })
        }
    }

    console.log(`Logged In As ${botClient.user.username}#${botClient.user.discriminator}`)
})

botClient.on("debug", (message) => {
    console.log(message)
})

botClient.on("messageCreate", (message) => {

})



botClient.login(process.env.TOKEN)