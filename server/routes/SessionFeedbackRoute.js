const express = require("express");
const router = express.Router();
const sessionFeedbackController = require("../controllers/SessionFeedbackController");
const verifyJWT = require("../middleware/verifyJWT");
const verifyAdmin = require("../middleware/verifyAdmin");
const multer = require("multer");
const upload = multer(); // שומר את הקובץ בזיכרון

router.post("/", verifyJWT,sessionFeedbackController.createSession);
router.get("/", verifyJWT, /*verifyAdmin,*/ sessionFeedbackController.getSessions);
router.get("/:_id", verifyJWT,/*verifyAdmin,*/ sessionFeedbackController.getSessionById);
router.put("/:_id", verifyJWT,/*verifyAdmin,*/ sessionFeedbackController.updateSession);
router.delete("/:_id", verifyJWT,/*verifyAdmin,*/ sessionFeedbackController.deleteSession);
router.get("/user/mysessions", verifyJWT, sessionFeedbackController.getUserSessions);

router.get("/:_id/messages", verifyJWT,/*verifyAdmin,*/ sessionFeedbackController.getMessages);
router.put("/:_id/messages/mark-all-read", verifyJWT, sessionFeedbackController.markAllMessagesAsRead);

router.get("/:_id/messages/:messageId", verifyJWT, sessionFeedbackController.getMessageById);

router.put("/:_id/messages", verifyJWT, upload.single("file"), sessionFeedbackController.createMessage);
router.put("/:_id/messages/:messageId", verifyJWT/*,verifyAdmin*/, sessionFeedbackController.updateMessage);
router.put("/:_id/messages/:messageId/read", verifyJWT, sessionFeedbackController.updateMessageReadStatus);

router.put("/:_id/messages/:messageId/delete", verifyJWT,/*verifyAdmin,*/ sessionFeedbackController.deleteMessage);
// בתוך הקובץ של הראוטים שלך:

module.exports = router;
