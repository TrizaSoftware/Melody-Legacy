const { ShardingManager } = require('discord.js');
const path = require("path")

const manager = new ShardingManager(path.join(__dirname, "bot.js"), { token: process.env.TOKEN, totalShards: "auto" });

manager.on('shardCreate', shard => {
    console.log(`[SHARD ${shard.id}] Launched`)
    shard.on("ready", () => {
        shard.send({type: "shardid", id: shard.id})
    })

    shard.on("death", () => {
        console.log(`Shard ${shard.id} died.`)
    })

    shard.on("reconnecting", () => {
        console.log(`Shard ${shard.id} attempting reconnect.`)
    })
});

manager.spawn();

module.exports = manager
