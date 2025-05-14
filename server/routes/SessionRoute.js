const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/SessionController");
const verifyJWT = require("../middleware/verifyJWT");
const verifyAdmin = require("../middleware/verifyAdmin");

router.post("/", verifyJWT, sessionController.createSession);
router.get("/", verifyJWT, verifyAdmin, sessionController.getSessions);
router.get("/:_id", verifyJWT,verifyAdmin, sessionController.getSessionById);
router.put("/:_id", verifyJWT,verifyAdmin, sessionController.updateSession);
router.delete("/:_id", verifyJWT,verifyAdmin, sessionController.deleteSession);
router.get("/user/mysessions", verifyJWT, sessionController.getUserSessions);

router.get("/:_id/messages", verifyJWT,verifyAdmin, sessionController.getMessages);
router.get("/:_id/messages/:messageId", verifyJWT, sessionController.getMessageById);

router.put("/:_id/messages", verifyJWT, sessionController.createMessage); 
router.put("/:_id/messages/:messageId", verifyJWT,verifyAdmin, sessionController.updateMessage);
router.put("/:_id/messages/:messageId/delete", verifyJWT,verifyAdmin, sessionController.deleteMessage);

module.exports = router;
