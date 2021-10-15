const express = require("express")
const app = express()

app.use("/api", require("./api"))

app.use((req, res) => {
  res.status(200).json({message: "OK"})
});

app.listen(3000, () => {
  console.log("[WEB] Melody server online.")
})