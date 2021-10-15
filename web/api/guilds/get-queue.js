const {getVCManager} = require("../../../discord/utils/voiceConnectionManager")

module.exports = {
  allowedMethods: ["GET"],
  methodHandlers: {
    GET: {
      async handle(req, res){
        if(!req.query.guildid || req.query.guildid == ""){
          res.status(400).json({error: true, errorcode: 400, message: "No guildid present in query."})
          return
        }
        if(!getVCManager(req.query.guildid)){
          res.status(404).json({error: true, errorcode: 400, message: `No data for guild ${req.query.guildid} exists.`})
        }else{
          res.status(200).json({success: true, data: getVCManager(req.query.guildid).queue || []})
        }
      }
    }
  }
}