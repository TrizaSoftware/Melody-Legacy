module.exports = class commandBase{
    constructor(name, category, aliases, desc, slash, slashoptions, usage){
        this.name = name
        this.category = category
        this.aliases = aliases
        this.desc = desc
        this.slash = slash
        this.slashoptions = slashoptions
        this.usage = usage
    }
}