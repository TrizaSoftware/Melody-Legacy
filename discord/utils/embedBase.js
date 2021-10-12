const {MessageEmbed} = require("discord.js")
module.exports = class embed{
    constructor(title, description, fields, footer){
        if(!title){
            throw new Error("INVALID_EMBED_FIELDS")
        }else{
            const embed = new MessageEmbed()
            .setTitle(title)
            .setColor("#369457")
            if(description){
            embed.setDescription(description)
            }
            if(fields){
                for(let field of fields){
                    embed.addField(field.name, field.value, field.inline || false)
                }
            }
            if(!footer){
                embed.setFooter(`© T:Riza Corp 2020 - ${new Date().getFullYear()}`)
            }else{
                embed.setFooter(`${footer} | © T:Riza Corp 2020 - ${new Date().getFullYear()}`)
            }
            return embed
        }
    }
}