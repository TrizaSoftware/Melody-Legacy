const {getVoiceConnection, VoiceConnectionStatus, entersState} = require("@discordjs/voice")
const voiceConnectionManagers = {}
const events = require("events")

module.exports.getVCManager = function(guildid){
    return voiceConnectionManagers[guildid]
}

module.exports.VoiceConnectionManager = class VoiceConnectionManager{
    constructor(guildid, channelid){
      if(!guildid || !channelid){
        throw new Error("INVALID_FIELDS")
        return;
      }
      const EventEmitter = new events.EventEmitter()
      this.connection = getVoiceConnection(guildid)
      this.eventEmitter = EventEmitter
      this.currentChannelId = channelid
      this.queue = []
      console.log(this.connection)
      this.playSong = function(songId){

      }
      this.addToQueue = function(songId){
        
      }
      this.terminateManager = function(){
        console.log("[VoiceManager] Manager Terminated For Guild "+guildid)
        voiceConnectionManagers[guildid] = undefined
        this.connection.destroy()
      }
      this.connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) =>{
        try{
          await Promise.race([
            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
            entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
          ]);
          this.channelid = this.connection.joinConfig.channelId
        }catch(error){
          this.terminateManager()
        }
      })
      voiceConnectionManagers[guildid] = this
    }
}
