const cache = {}

module.exports.fetchServerCache = function(id){
    return cache[id]
}

module.exports.serverCache = class serverCache{
    constructor(serverid, dtiw){
        this.data = dtiw || {}
        this.updateData = function(key, index){
            this.data[key] = index
            console.log(this)
        }
        cache[serverid] = this
        return this
    }
}