const voiceConnectionManagers = {}

module.exports.voiceConnectionManager = function(channelId){
    return voiceConnectionManagers[channelId]
}

module.exports.voiceConnectionManager = class voiceConnectionManager{
    constructor(){

    }
}