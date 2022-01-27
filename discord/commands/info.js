const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const os = require('node-os-utils');
const cpu = os.cpu

module.exports = class Command extends commandBase{
    constructor(){
        super("info", "Information", ["i", "information"], "Shows all the information for Melody.", false)
    }
    async execute(message, args){
      message.deferReply()
      const version = require("../../package.json").version
      cpu.usage().then(data => {
        let embed = new embedBase("Melody Information", undefined, [{name: "Contributors:", value: "<@669668229974720513>, <@288426084872224768>, <@250643356185657345>"},{name: "CPU Usage:", value: `${data}%`}, {name: "Version:", value: version}])
          message.editReply({embeds: [embed]})
      })
    }
}