const botClient = require("../bot").Bot


module.exports.getServerCount = async function() {
    // get guild collection size from all the shards
    const req = await botClient.shard.fetchClientValues("guilds.cache.size");

    // return the added value
    return req.reduce((p, n) => p + n, 0);
}

module.exports.fetchEmoji = async function(eid){
    const req = await botClient.shard.broadcastEval((c, id) => c.emojis.cache.get(id), {context: eid})

    console.log(req)
}