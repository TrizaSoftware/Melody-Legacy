const commandBase = require("../utils/commandBase")

module.exports = class Command extends commandBase{
    constructor(){
        super("help","Information", ["h", "commands"], "Shows a list of commands.",true)
    }
    async execute(type, message, args){
        message.reply(`Hello from ${this.name}, interactionType: ${type}`)
    }
}