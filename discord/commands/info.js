const commandBase = require("../utils/commandBase")

module.exports = class Command extends commandBase{
    constructor(){
        super("information", "Information", ["i", "info", "botdata"], "Shows all information for Melody.", true)
    }
    async execute(type, message, args){

    }
}