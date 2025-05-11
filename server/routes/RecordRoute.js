const express = require("express");
const router = express.Router();
const RecordController = require("../controllers/RecordController");
const verifyJWT = require("../middleware/verifyJWT");

// נתיב להוספת הקלטה חדשה
router.post("/create"/*, verifyJWT*/, RecordController.createRecord);

// נתיב לקריאת כל ההקלטות
router.get("/", verifyJWT, RecordController.getAllRecords);

// נתיב לקריאת הקלטה לפי ID
router.get("/:_id", verifyJWT, RecordController.getRecordById);

// נתיב לעדכון הקלטה לפי ID
router.put("/:_id", verifyJWT, RecordController.updateRecord);

// נתיב למחיקת הקלטה לפי ID
router.delete("/:_id", verifyJWT, RecordController.deleteRecord);

module.exports = router;
