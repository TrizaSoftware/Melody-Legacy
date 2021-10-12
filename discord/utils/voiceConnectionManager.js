const {getVoiceConnection, VoiceConnectionStatus, entersState, AudioPlayerStatus, createAudioPlayer, createAudioResource, StreamType} = require("@discordjs/voice")
const ytdl = require("ytdl-core")
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
      console.log(`[VoiceManager] Connection Manager Created for Guild ${guildid}`)
      const EventEmitter = new events.EventEmitter()
      this.connection = getVoiceConnection(guildid)
      this.eventEmitter = EventEmitter
      this.eventEmitter._maxListeners = 1
      this.currentChannelId = channelid
      this.playingSong = false
      this.shouldLoop = false
      this.queue = []
      this.currentSong = undefined
      this.audioPlayer = createAudioPlayer()
      this.playSong = async function(data){
        let stream = ytdl(data.url, {
          filter: "audioonly",
          highWaterMark: 1 << 25,
        })
        
      try{
       let resource = createAudioResource(stream, {inputType: StreamType.Arbitrary})
        this.audioPlayer.play(resource)
       await entersState(this.audioPlayer, AudioPlayerStatus.Playing, 5_000).then(() => {
         this.eventEmitter.emit("songData", "playing", data)
         this.currentSong = data
         this.connection.subscribe(this.audioPlayer)
         this.playingSong = true
       })
      }catch(err){
        console.log(err)
        this.eventEmitter.emit("songData", "error", err)
      }
      }

      this.addToQueue = function(data){
        this.queue[this.queue.length] = data
        console.log(this.queue)
        if (this.queue.length == 1){
          this.playSong(this.queue[0])
        }else{
          return "addedToQueue"
        }
      }
      this.terminateManager = function(){
        console.log(`[VoiceManager] Connection Terminated for Guild ${guildid}`)
        voiceConnectionManagers[guildid] = undefined
        this.connection.destroy()
      }
      this.connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) =>{
        try{
          await Promise.race([
            entersState(this.connection, VoiceConnectionStatus.Signalling, 5_000),
            entersState(this.connection, VoiceConnectionStatus.Connecting, 5_000),
          ]).then((response) =>{
            this.currentChannelId = response.joinConfig.channelId
            console.log(`[VoiceManager] Moved to channel ${this.currentChannelId}`)
            this.shouldLoop = false
          })
        }catch(error){
          this.terminateManager()
        }
      })

      this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
           this.playingSong = false
           this.eventEmitter.emit("songData", "end")
           this.queue.shift()
           if (this.shouldLoop){
             this.queue.push(this.currentSong)
           }
           if (this.queue.length > 0){
             this.playSong(this.queue[0])
           }else{
             this.eventEmitter.emit("songData", "queueEnd")
           }
       })

      voiceConnectionManagers[guildid] = this
    }
}