const express = require("express");
const fs = require("fs")
const bodyParser = require("body-parser")
const router = express.Router();
const multer = require('multer');
const path = require("path")
const upload = multer();

router.use(express.json());
router.use(express.urlencoded({extended: false, limit: "13MB"}))

function checkmethodAccess(sentMethod, methods){
  for(let method of methods){
    if (sentMethod == method){
      return true
    }
  }
  return false
}

/*
router.use("/docs", (req, res) => {
  res.setHeader("Content-Security-Policy", "script-src: 'self' 'unsafe-inline' https://www.triza.dev https://triza.dev")
  res.sendFile(path.join(__dirname, "/docs.html"))
})
*/

router.use(async (req, res) => {
  let pathname = req.originalUrl
  pathname = pathname.replace("/api", "")
  pathname = pathname.split("?")[0]
  if(pathname == "/"){
    res.status(200).json({message: "OK"})
    return;
  }
  if (!pathname.endsWith(".js")){
    pathname = `${pathname}.js`
  }else{
    res.status(404).json({error: true, errorcode: 404, message: "This API doesn't exist."})
  }
  if (fs.existsSync(`${__dirname}${pathname}`) && pathname !== ""){
    try{
      let file = await require(`${__dirname}${pathname}`)
      let methodAllowed = checkmethodAccess(req.method, file.allowedMethods)
      if(methodAllowed){
        await file.methodHandlers[req.method].handle(req, res)
      }else{
        res.status(405).json({error: true, errorcode: 405, message: "Method Not Supported."})
      }
    }catch(err){
      console.log(err)
    res.status(500).json({error: true, errorcode: 500, message: "An internal server error has occurred."})
    }
  }else{
    res.status(404).json({error: true, errorcode: 404, message: "This API doesn't exist."})
  }
});

module.exports = router