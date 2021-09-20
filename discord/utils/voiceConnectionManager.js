const voiceConnectionManagers = {}

module.exports.voiceConnectionManager = function(channelId){
    return voiceConnectionManagers[channelId]
}

module.exports.voiceConnectionManager = class voiceConnectionManager{
    constructor(){
       let event = this.createEvent("Event")
       event.initEvent("Notification", true, true)
    }
}
