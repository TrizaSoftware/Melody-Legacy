const cache = {}

module.exports.fetchServerCache = function(id){
    return cache[id]
}

module.exports.serverCache = class serverCache{
    constructor(serverid, dtiw){
        this.data = dtiw || {}
        this.updateData = function(key, index){
            this.data[key] = index
        }
        cache[serverid] = this
        return this
    }
}