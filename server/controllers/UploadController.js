
const fs = require("fs");
const path = require("path");
const gcs = require("../service/gcsService");

const uploadToCloudDirect = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const data = await gcs.uploadToGCS(file);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Upload to GCS failed", details: err.message });
  }
};

const uploadLocalThenCloud = async (req, res) => {
  console.log('📍 התחלת uploadLocalThenCloud');

  try {
    const file = req.file;
    console.log('📁 req.file:', file);

    if (!file) {
      console.log('❌ לא הועלה קובץ');
      return res.status(400).json({ error: "No file uploaded" });
    }

    const localPath = path.join(__dirname, "../uploads", file.name);
    console.log('📂 נתיב מקומי של הקובץ:', localPath);

    const buffer = fs.readFileSync(localPath);
    console.log('📦 נקרא buffer מתוך הקובץ המקומי (אורך:', buffer.length, ')');

    const uploaded = await gcs.uploadToGCS({
      originalname: file.originalname,
      mimetype: file.mimetype,
      buffer
    });
    console.log('✅ הקובץ הועלה לענן GCS בהצלחה:', uploaded);

    fs.unlinkSync(localPath);
    console.log('🧹 נמחק הקובץ המקומי:', localPath);

    res.status(200).json(uploaded);
    console.log('📤 נשלחה תשובה ללקוח עם פרטי ההעלאה');
  } catch (err) {
    console.error('💥 שגיאה בהעלאת קובץ:', err);
    res.status(500).json({ error: "Upload local then GCS failed", details: err.message });
  }
};

const deleteFromCloud = async (req, res) => {
  try {
    const { filename } = req.params;
    const result = await gcs.deleteFromGCS(filename);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete", details: err.message });
  }
};

const streamFromCloud = (req, res) => {
  const range = req.headers.range;
  if (!range) return res.status(400).send("Requires Range header");

  const fileName = req.params.filename;
  gcs.streamFromGCS(fileName, range, res);
};

const getSignedUrl = async (req, res) => {
  try {
    const { filename } = req.params;
    const urlData = await gcs.generateSignedUrl(filename);
    res.status(200).json(urlData);
  } catch (err) {
    res.status(500).json({ error: "Failed to get signed URL", details: err.message });
  }
};

module.exports = {
  uploadToCloudDirect,
  uploadLocalThenCloud,
  deleteFromCloud,
  streamFromCloud,
  getSignedUrl
};
