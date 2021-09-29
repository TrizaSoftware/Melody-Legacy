const voiceConnectionManagers = {}
const events = require("events")

module.exports = class VoiceConnectionManager{
  static getVCManager(channelId){

  }
  eventEmitter;
    constructor(channelId){
        const EventEmitter = new events.EventEmitter()
        this.eventEmitter = EventEmitter
        voiceConnectionManagers[channelId] = this
        EventEmitter.emit("test")
    }
}
