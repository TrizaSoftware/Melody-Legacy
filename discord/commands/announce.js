const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const {getVCManager} = require("../utils/voiceConnectionManager")
const bot = require("../bot")

module.exports = class Command extends commandBase{
    constructor(){
        super("announce", "Staff", ["a"], "Announces a message to all servers.", true, [{name: "message", required: true, type: 3, description: "What you want to announce."}], true)
    }
    async execute(type, message, args){
    }
}