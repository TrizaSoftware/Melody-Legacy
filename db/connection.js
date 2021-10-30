const mongoose = require("mongoose")

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true}).catch(err => {
    console.log(err)
})

const connection = mongoose.connections[0]

connection.on("connected", () => {
    console.warn("[Melody DB]: Connected")
})

module.exports = connection
