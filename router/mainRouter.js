const express = require("express")
const router = express.Router()

const {
    register, login, profileInfo, changeImage, changePassword, allPosts, allUsers, allMessages
} = require("../controller/mainController")

const validators = require ('../middleware/validators')

router.post ("/register",validators.validation, register)
router.post ("/login",validators.validation, login)
router.get ("/profile", validators.authorization, profileInfo)
router.post ("/changeImage", validators.authorization, changeImage)
router.post ("/changePassword", validators.authorization, changePassword)
router.get ("/allPosts", allPosts )
router.get("/allUsers", allUsers)
router.get("/allMessages", validators.authorization, allMessages)

module.exports=router