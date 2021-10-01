const voiceConnectionManagers = {}
const events = require("events")

module.exports.getVCManager = function(guildid){
    return voiceConnectionManagers[guildid]
}

module.exports.VoiceConnectionManager = class VoiceConnectionManager{
    constructor(guildid,channelid){
        const EventEmitter = new events.EventEmitter()
        this.eventEmitter = EventEmitter
        this.currentChannelId = guildid
    }
}
