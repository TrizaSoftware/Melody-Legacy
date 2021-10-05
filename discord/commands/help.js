const commandBase = require("../utils/commandBase")
const {Bot} = require("../index")

module.exports = class Command extends commandBase{
    constructor(){
        super("help","Information", ["h", "commands"], "Shows a list of commands.",true)
    }
    async execute(type, message, args){
    }
}