const commandBase = require("../utils/commandBase")
const Data = require("../index")

module.exports = class Command extends commandBase{
    constructor(){
        super("help","Information", ["h", "commands"], "Shows a list of commands.",true)
    }
    async execute(type, message, args){
      console.log(Data.Bot)
    }
}