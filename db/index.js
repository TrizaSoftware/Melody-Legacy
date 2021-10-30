const models = require("./models")
const connection = require("./connection")

module.exports = {
    connection,
    ...models
}