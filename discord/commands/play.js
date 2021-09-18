const commandBase = require("../utils/commandBase")

module.exports = class Command extends commandBase{
    constructor(){
        super("play", "Music", ["p", "song"], "Plays Music", true, {name: "query", type: 3, description: "The song you want to play.", required: true})
    }
    async execute(type, message, args){

    }
}