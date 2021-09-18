module.exports = class commandBase{
    constructor(name, category, aliases, desc, slash, usage){
        this.name = name
        this.category = category
        this.aliases = aliases
        this.desc = desc
        this.slash = slash
        this.usage = usage
    }
}