const commandBase = require("../utils/commandBase")

module.exports = class Command extends commandBase{
    constructor(){
        super("information", "Information", ["i", "info"], true)
    }
}