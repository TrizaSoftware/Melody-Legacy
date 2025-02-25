const { getVoiceConnection, VoiceConnectionStatus, entersState, AudioPlayerStatus, createAudioPlayer, createAudioResource, StreamType, joinVoiceChannel } = require("@discordjs/voice")
const {Player} = require("erela.js")
const voiceConnectionManagers = {}
const events = require("events")
const dataCache = require("./dataCache")
const Discord = require("..")
const ytdl = require("ytdl-core")

module.exports.getVCManager = function (guildid) {
  return voiceConnectionManagers[guildid]
}

module.exports.VoiceConnectionManager = class VoiceConnectionManager {
  constructor(guildid, channelid) {
    if (!guildid || !channelid) {
      throw new Error("INVALID_FIELDS")
      return;
    }
    console.log(`[VoiceManager] Connection Manager Created for Guild ${guildid}`)
    const EventEmitter = new events.EventEmitter()
    this.eventEmitter = EventEmitter
    this.eventEmitter._maxListeners = 1
    this.currentChannelId = channelid
    this.playingSong = false
    this.currentSongId = 0
    this.loopType = undefined
    this.queue = []
    this.currentSong = undefined
    this.audioPlayer = createAudioPlayer()
    //this.erelaPlayer = new Player({guild: guildid, selfDeafen: true, voiceChannel: channelid})
    //this.erelaPlayer.connect()
    this.connection = getVoiceConnection(guildid)
    this.volume = 1
    this.timeoutTimer
    this.currentAudioResource
    this.playSong = async function (data) {
      //this.erelaPlayer.play(data)
      let stream = ytdl(data.url, {
        filter: "audioonly",
        quality: "lowestaudio"
      })

      try {
        this.currentAudioResource = createAudioResource(stream, { inputType: StreamType.WebmOpus, inlineVolume: true })
        this.currentAudioResource.volume.setVolume(this.volume)
        this.audioPlayer.play(this.currentAudioResource)
        await entersState(this.audioPlayer, AudioPlayerStatus.Playing, 5_000).then(() => {
          this.eventEmitter.emit("songData", "playing", data)
          this.currentSong = data
          this.connection.subscribe(this.audioPlayer)
          this.playingSong = true
        })
      } catch (err) {
        if (!err.toString().includes(403) && !err.toString().includes("AbortError")) {
          console.log(err)
          this.eventEmitter.emit("songData", "error", "An error has occurred and the process has been cancelled.")
        } else {
          this.playSong(data)
        }
      }
    }

    this.changeVolume = function(number){
      this.volume = number
      this.currentAudioResource.volume.setVolume(number)
    }

    this.addToQueue = async function (data) {
      if(data.resolve){
        let name = `${data.author} - ${data.title}`
        await data.resolve()
        data = {name: name, url: data.uri}
      }
      this.queue[this.queue.length] = data
      if (this.queue.length == 1) {
        this.playSong(this.queue[0])
      }
      if (this.timeoutTimer) {
        clearTimeout(this.timeoutTimer)
        this.timeoutTimer = undefined
      }
    }
    this.terminateManager = function () {
      console.log(`[VoiceManager] Connection Terminated for Guild ${guildid}`)
      voiceConnectionManagers[guildid] = undefined
      this.connection.destroy()
    }
    this.connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
      try {
        await Promise.race([
          entersState(this.connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(this.connection, VoiceConnectionStatus.Connecting, 5_000),
        ]).then((response) => {
          let serverdata = dataCache.fetchServerCache(guildid)
          if (serverdata && serverdata.data.musicLockEnabled && response.joinConfig.channelId !== serverdata.data.musicChannelId) {
            this.eventEmitter.emit("songData", "error", "You can't drag me out of the music channel.")
          } else {
            this.currentChannelId = response.joinConfig.channelId
            console.log(`[VoiceManager] Moved to channel ${this.currentChannelId}`)
            this.loopType = undefined
          }
        })
      } catch (error) {
        this.terminateManager()
      }
    })
    this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
      this.playingSong = false
      this.eventEmitter.emit("songData", "end")
      if (!this.loopType) {
        if((this.currentSongId) > 0){
          this.queue.splice(this.currentSongId, this.currentSongId)
          this.currentSongId = 0
        }else{
          this.queue.shift()
        }
      }
      if (this.queue.length > 0) {
        if(this.loopType == "song"){
          this.playSong(this.queue[0])
        }else{
          if (this.queue[this.currentSongId + 1] && this.loopType == "queue"){
            this.currentSongId += 1
          }else{
            this.currentSongId = 0
          }
          this.playSong(this.queue[this.currentSongId])
        }
      } else {
        let dfr = this
        this.timeoutTimer = setTimeout(function () {
          if (!dfr.queue[0]) {
            dfr.eventEmitter.emit("songData", "timeout")
            dfr.terminateManager()
          }
        }, 300000)
      }
    })

    voiceConnectionManagers[guildid] = this
  }
}
