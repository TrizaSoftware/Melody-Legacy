const express = require("express")
const app = express()

app.use("/api", require("./api"))

app.use("/invite", (req, res) => {
  res.redirect("https://discord.com/oauth2/authorize?client_id=726143653898354758&permissions=6445862216&scope=bot%20applications.commands")
})

app.use("/join", (req, res) => {
  res.redirect("https://discord.gg/JwzQtgEwFE")
})

app.use((req, res) => {
  res.status(200).json({message: "OK"})
});

app.listen(3000, () => {
  console.log("[WEB] Melody server online.")
})