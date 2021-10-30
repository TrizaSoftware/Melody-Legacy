module.exports = class commandBase{
    constructor(name, category, aliases, desc, slashonly, slashoptions, usage){
        this.name = name
        this.category = category
        this.aliases = aliases
        this.desc = desc
        this.slashonly = slashonly
        this.slashoptions = slashoptions
        this.usage = usage
    }
}