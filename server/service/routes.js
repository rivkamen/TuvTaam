const express = require("express");
const multer = require("multer");
const gcs = require("./gcsService");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const data = await gcs.uploadToGCS(req.file);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

router.get("/stream/:filename", (req, res) => {
  const range = req.headers.range;
  if (!range) return res.status(400).send("Requires Range header");

  gcs.streamFromGCS(req.params.filename, range, res);
});

module.exports = router;
