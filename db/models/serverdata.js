const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    serverId: {type: String, required: true},
    prefix: {type: String, required: false},
    musicChannelId: {type: String, required: false},
    musicLockEnabled: {type: Boolean, required: false}
})

const model = mongoose.model("serverdata",schema)
module.exports = model