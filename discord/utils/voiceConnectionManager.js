const voiceConnectionManagers = {}
const events = require("events")

module.exports.voiceConnectionManager = function(channelId){
    return voiceConnectionManagers[channelId]
}

module.exports.voiceConnectionManager = class voiceConnectionManager{
    constructor(){
        const EventEmitter = new events.EventEmitter()
        this.eventEmitter = EventEmitter
        return this
    }
}
