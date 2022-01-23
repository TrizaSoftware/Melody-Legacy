const commandBase = require("../utils/commandBase")
const embedBase = require("../utils/embedBase")
const componentBase = require("../utils/componentBase")
const {getVCManager} = require("../utils/voiceConnectionManager")

module.exports = class Command extends commandBase{
    constructor(){
        super("queue", "Music", ["q"], "Shows the queue for music.", false)
    }
    async execute(type, message, args){
      if (type == "interaction"){
        let member = message.guild.members.cache.find(member => member.id == message.user.id)
        message.member = member
        message.reply({content: "The queue is now loading.", ephemeral: true})
      }
      if(!getVCManager(message.guild.id)){
        message.reply({embeds: [new embedBase("Error", "Bot is not in a voice channel.")]})
      }else{
        let vcm = getVCManager(message.guild.id)
        if(vcm.queue.length == 0){
          message.reply({embeds: [new embedBase("No Queue", "No queue data to show.")]})
        }else{
          if (vcm.loopType == "queue" || vcm.currentSongId > 0){
            let pages = []
            let currentreadingpage = 0
            let currentpage = 0
            for (let i = 0; i < vcm.queue.length; i++){
              if (i%10==0 && i !== 0){
                currentreadingpage += 1
              }
              if(!pages[currentreadingpage]){
                pages[currentreadingpage] = []
              }
              if(i == vcm.currentSongId){
                pages[currentreadingpage][pages[currentreadingpage].length] = {name: `${i + 1}.`, value:`${vcm.queue[i].name} (Now Playing)`}
              }else{
                pages[currentreadingpage][pages[currentreadingpage].length] = {name: `${i + 1}.`, value:`${vcm.queue[i].name}`}
              }
            }
            let components = []
            if(pages.length !== 1){
              components = [new componentBase("button", [{style: "SUCCESS", text:"⏪", disabled: true},{style: "SUCCESS", text:"⏩"}])]
            }
            const botMsg = await message.channel.send({embeds:[new embedBase("Queue", `Currently Playing: ${vcm.queue[vcm.currentSongId].name}`, pages[currentpage], `Page 1/${pages.length}`)], components: components })
            const collector = message.channel.createMessageComponentCollector({ componentType: 'BUTTON', time: 300000 });
            collector.on("collect", i => {
              if(i.message.id !== botMsg.id){
                return
              }
              if (i.user.id == message.member.id) {
                i.reply({components: []}).catch((err) => {
                  console.log(err)
                })
                if(i.customId == "⏩"){
                  let disabledNext = (currentpage + 1 == pages.length -1)
                  currentpage += 1
                  i.message.edit({embeds:[new embedBase("Queue", `Currently Playing: ${vcm.queue[vcm.currentSongId].name}`, pages[currentpage],`Page ${currentpage+1}/${pages.length}`)], components: [new componentBase("button", [{style: "SUCCESS", text:"⏪"},{style: "SUCCESS", text:"⏩", disabled: disabledNext}])] })
                }else if(i.customId == "⏪"){
                  let disabledNext = (currentpage - 1 == 0)
                  currentpage -= 1
                  i.message.edit({embeds:[new embedBase("Queue", `Currently Playing: ${vcm.queue[vcm.currentSongId].name}`, pages[currentpage],`Page ${currentpage+1}/${pages.length}`)], components: [new componentBase("button", [{style: "SUCCESS", text:"⏪", disabled: disabledNext},{style: "SUCCESS", text:"⏩"}])] })
                }
              }else{
                i.reply({content: "You can't touch these buttons.", ephemeral: true})
              }
            })
          }else{
            let pages = []
            let currentreadingpage = 0
            let currentpage = 0
            for (let i = 0; i < vcm.queue.length; i++){
              if (i%10==0 && i !== 0){
                currentreadingpage += 1
              }
              if(!pages[currentreadingpage]){
                pages[currentreadingpage] = []
              }
              if(i !== 0){
                pages[currentreadingpage][pages[currentreadingpage].length] = {name: `${i}.`, value:`${vcm.queue[i].name}`}
              }
            }
            let components = []
            if(pages.length !== 1){
              components = [new componentBase("button", [{style: "SUCCESS", text:"⏪", disabled: true},{style: "SUCCESS", text:"⏩"}])]
            }
            const botMsg = await message.channel.send({embeds:[new embedBase("Queue", `Currently Playing: ${vcm.queue[0].name}`, pages[currentpage], `Page 1/${pages.length}`)], components: components })
            const collector = message.channel.createMessageComponentCollector({ componentType: 'BUTTON', time: 300000 });
            collector.on("collect", i => {
              if(i.message.id !== botMsg.id){
                return
              }
              if (i.user.id == message.member.id) {
                i.reply({components: []}).catch((err) => {
                  console.log(err)
                })
                if(i.customId == "⏩"){
                  let disabledNext = (currentpage + 1 == pages.length -1)
                  currentpage += 1
                  i.message.edit({embeds:[new embedBase("Queue", `Currently Playing: ${vcm.queue[0].name}`, pages[currentpage],`Page ${currentpage+1}/${pages.length}`)], components: [new componentBase("button", [{style: "SUCCESS", text:"⏪"},{style: "SUCCESS", text:"⏩", disabled: disabledNext}])] })
                }else if(i.customId == "⏪"){
                  let disabledNext = (currentpage - 1 == 0)
                  currentpage -= 1
                  i.message.edit({embeds:[new embedBase("Queue", `Currently Playing: ${vcm.queue[0].name}`, pages[currentpage],`Page ${currentpage+1}/${pages.length}`)], components: [new componentBase("button", [{style: "SUCCESS", text:"⏪", disabled: disabledNext},{style: "SUCCESS", text:"⏩"}])] })
                }
              }else{
                i.reply({content: "You can't touch these buttons.", ephemeral: true})
              }
            })
          }
        }
      }
    }
}