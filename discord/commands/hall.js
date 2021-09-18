const commandBase = require("../utils/commandBase")

module.exports = class Command extends commandBase{
    constructor(){
        super("hall", "Random", ["hq"], "Get the most infamous Mr. Hall Quote", true)
    }
    async execute(type, message, args){
        message.reply("\"You can make me a wizard and I can do spells and stuff.\" - Mr. Hall 2020")
    }
}