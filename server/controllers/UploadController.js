// // const { Storage } = require('@google-cloud/storage');
// // const Record = require('../models/Record');
// // const path = require('path');

// // const storage = new Storage({ keyFilename: 'gcs-key.json' });
// // const bucket = storage.bucket('your-gcs-bucket-name');

// // // פונקציה להעלאת קובץ ל-GCS
// // const uploadRecording = async (req, res) => {
// //   try {
// //     const { recordName, type, belonging, IsSpecial } = req.body;
// //     const file = req.file;  // קובץ שמועבר מהלקוח

// //     if (!file) {
// //       return res.status(400).send('No file uploaded');
// //     }

// //     // יצירת שם קובץ ייחודי
// //     const filePath = `recordings/${recordName.replace(/\s+/g, '_')}-${Date.now()}.mp3`;
// //     const fileUpload = bucket.file(filePath);
    
// //     const stream = fileUpload.createWriteStream({
// //       resumable: false,
// //       metadata: { contentType: file.mimetype },
// //     });

// //     stream.end(file.buffer);

// //     stream.on('finish', async () => {
// //       const fileUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

// //       // שמירת הנתיב במסד הנתונים
// //       const newRecord = new Record({
// //         recordName,
// //         type,
// //         belonging,
// //         IsSpecial,
// //         path: fileUrl,
// //       });

// //       await newRecord.save();

// //       res.status(201).json({ message: 'Upload successful', url: fileUrl });
// //     });

// //     stream.on('error', (err) => {
// //       console.error(err);
// //       res.status(500).send('Upload failed');
// //     });
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).send('Server error');
// //   }
// // };

// // module.exports = { uploadRecording };


// const fs = require("fs");
// const path = require("path");
// const gcs = require("../services/gcsService");
// const Record = require("../models/recordModel");

// const createRecord = async (req, gcsResult, res) => {
//   try {
//     const newRecord = await Record.create({
//       recordName: req.body.recordName,
//       type: req.body.type,
//       belonging: req.body.belonging,
//       IsSpecial: req.body.IsSpecial === "true",
//       path: gcsResult.publicUrl,
//     });
//     res.status(201).json(newRecord);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.uploadMemory = async (req, res) => {
//   try {
//     const result = await gcs.uploadToGCS(req.file);
//     await createRecord(req, result, res);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.uploadDisk = async (req, res) => {
//   try {
//     const filePath = path.join(__dirname, "..", req.file.path);
//     const buffer = fs.readFileSync(filePath);
//     const fileData = { ...req.file, buffer };
//     const result = await gcs.uploadToGCS(fileData);

//     fs.unlinkSync(filePath);
//     await createRecord(req, result, res);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

const fs = require("fs");
const path = require("path");
const gcs = require("../gcsService");

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
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const localPath = path.join(__dirname, "../uploads", file.filename);

    const buffer = fs.readFileSync(localPath);
    const uploaded = await gcs.uploadToGCS({
      originalname: file.originalname,
      mimetype: file.mimetype,
      buffer
    });

    fs.unlinkSync(localPath); // optional cleanup
    res.status(200).json(uploaded);
  } catch (err) {
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
