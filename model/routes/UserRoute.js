const express = require("express")
const router = express.Router()
const UserController = require("../controller/userController")
const verifyJWT = require("../middleware/verifyJWT")

// router.use(verifyJWT)
router.get("/",verifyJWT, UserController.getUsers)
router.post("/",verifyJWT,UserController.createUser)
router.put("/:_id",verifyJWT, UserController.updateUser)
router.delete("/:_id",verifyJWT, UserController.deleteUser)
router.get("/:_id",verifyJWT, UserController.getUserById)
router.get("/phone/:phone",verifyJWT, UserController.getUserByPhone)


module.exports = router