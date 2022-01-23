const {MessageActionRow, MessageButton} = require("discord.js")

module.exports = class component{
    constructor(type, data){
        if(type == "button"){
            let row = new MessageActionRow()
            let currentNum = 0
            for(let button of data){
                currentNum = currentNum + 1
                let object = new MessageButton()
                .setStyle(button.style || "PRIMARY")
                .setLabel(button.text)
                .setDisabled(button.disabled || false)
                .setCustomId(button.text)
                row.addComponents(object)
            }
            
            return row
        }
    }
}