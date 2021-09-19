const voiceChannelManagers = {}

module.exports.getVoiceChannelManager = function(channelId){
    return voiceChannelManagers[channelId]
}

module.exports.voiceChannelManager = class voiceChannelManager{

}