const express = require("express")
const router = express.Router()
const userRoutes = require("./user.routes")
const postRoutes = require("./post.routes")

router.get("/", (req, res) => {
  console.log("aaaaaaaaaaa")
  res.send("Working!!!")
})

// This endpoint will have all the user routes. 
router.use("/user", userRoutes)

// This endpoint will have all the post routes. 
router.use("/post", postRoutes)

http: module.exports = router
