const voiceConnectionManagers = {}
const events = require("events")

module.exports.getVCManager = function(channelId){
    return voiceConnectionManagers[channelId]
}

module.exports.VoiceConnectionManager = class VoiceConnectionManager{
    constructor(channelId){
        const EventEmitter = new events.EventEmitter()
        this.eventEmitter = EventEmitter
        this.currentChannelId = channelId
        console.log(this)
        EventEmitter.emit("dataSend", "Test")
    }
}
