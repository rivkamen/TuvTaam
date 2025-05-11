// // const express = require("express");
// // const router = express.Router();
// // const RecordController = require("../controllers/UploadController");
// // const verifyJWT = require("../middleware/verifyJWT");

// // router.post("/upload"/*, verifyJWT*/, RecordController.uploadRecording);

// // module.exports = router;
// const express = require("express");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const uploadController = require("../controllers/UploadController");
// const verifyJWT = require("../middleware/verifyJWT");

// const router = express.Router();

// const memoryUpload = multer({ storage: multer.memoryStorage() });
// const diskUpload = multer({ dest: "uploads/" });

// router.post("/memory", memoryUpload.single("file"),/*verifyJWT, */ uploadController.uploadMemory);
// router.post("/disk", diskUpload.single("file"),/*verifyJWT, */ uploadController.uploadDisk);

// module.exports = router;
const express = require("express");
const multer = require("multer");
const uploadController = require("../controllers/UploadController");

const router = express.Router();

const memoryUpload = multer({ storage: multer.memoryStorage() });
const diskUpload = multer({ dest: "uploads/" });

// העלאה ישירה לענן
router.post("/upload/direct", memoryUpload.single("file"), uploadController.uploadToCloudDirect);

// שמירה מקומית ואז ענן
router.post("/upload/local", diskUpload.single("file"), uploadController.uploadLocalThenCloud);

// מחיקה מהענן
router.delete("/file/:filename", uploadController.deleteFromCloud);

// סטרימינג מהענן
router.get("/stream/:filename", uploadController.streamFromCloud);

// קבלת כתובת חתומה
router.get("/signed-url/:filename", uploadController.getSignedUrl);

module.exports = router;
