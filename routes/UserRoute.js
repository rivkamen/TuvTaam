const express = require("express")
const router = express.Router()
const UserController = require("../controllers/userController")
const verifyJWT = require("../middleware/verifyJWT")
const verifyAdmin = require("../middleware/verifyAdmin")

router.get("/",verifyJWT,verifyAdmin, UserController.getUsers)
router.put("/:_id",verifyJWT, UserController.updateUser)
router.delete("/:_id",verifyJWT, UserController.deleteUser)
router.get("/:_id",verifyJWT, UserController.getUserById)

module.exports = router