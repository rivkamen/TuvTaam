
const Record = require('../models/Record');
const gcs = require('../service/gcsService');

// העלאה + שמירה במסד
const uploadAndCreateRecord = async (req, res) => {

  try {
    const file = req.file;
      console.log(file);

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // שלב 1: העלאה ל-GCS
    const uploaded = await gcs.uploadToGCS(file);

    // שלב 2: שמירת הנתונים במסד
    const { recordName, recordSource, type, belonging, IsSpecial } = req.body;
    if (!recordName || !recordSource || !type || !belonging) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const newRecord = new Record({
      recordName,
      recordSource,
      type,
      belonging,
      IsSpecial,
      path: uploaded.name // או uploaded.url אם שומרת URL מלא
    });

    await newRecord.save();

    res.status(201).json({ message: "Record uploaded and saved", record: newRecord });
  } catch (err) {
    console.error("❌ uploadAndCreateRecord error:", err);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
};


const getRecordById = async (req, res) => {
  try {
    const { _id } = req.params;
    const record = await Record.findById(_id);

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    const signedUrlData = await gcs.generateSignedUrl(record.path);
    console.log("hgjhjkhjkhkhkhk");
    
    console.log(signedUrlData.signedUrl);
    console.log("signedUrlData.signedUrl");
    
    return res.status(200).json({
      ...record.toObject(),
      signedUrl: signedUrlData.signedUrl,
      expiresAt: signedUrlData.expiresAt
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateRecord = async (req, res) => {
  try {
    const { _id } = req.params;
    const { recordName,recordSource, type, belonging, IsSpecial, path } = req.body;

    const record = await Record.findById(_id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    record.recordName = recordName || record.recordName;
    record.recordSource = recordSource || record.recordSource;
    record.type = type || record.type;
    record.belonging = belonging || record.belonging;
    record.IsSpecial = IsSpecial !== undefined ? IsSpecial : record.IsSpecial;
    record.path = path || record.path;

    await record.save();

    const signedUrlData = await gcs.generateSignedUrl(record.path);

    return res.status(200).json({ 
      message: 'Record updated successfully', 
      record: {
        ...record.toObject(),
        signedUrl: signedUrlData.url,
        expiresAt: signedUrlData.expiresAt
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllRecords = async (req, res) => {
  try {
    console.log("kiii");
    
    const records = await Record.find();
    
    const enhancedRecords = await Promise.all(records.map(async (record) => {
      const signedUrlData = await gcs.generateSignedUrl(record.path); 
    
    console.log(signedUrlData.signedUrl);
    console.log("signedUrlData.signedUrl");
      return {
        ...record.toObject(),
        signedUrl: signedUrlData.signedUrl,
        expiresAt: signedUrlData.expiresAt
      };
    }));

    return res.status(200).json(enhancedRecords);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const { _id } = req.params;

    const record = await Record.findById(_id);
    if (!record) return res.status(404).json({ message: 'Record not found' });

    // מחיקת הקובץ מ-GCS
    await gcs.deleteFromGCS(record.path);

    // מחיקת הרשומה מהמסד
    await Record.findByIdAndDelete(_id);

    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete record', details: err.message });
  }
};

module.exports = { uploadAndCreateRecord, getAllRecords, getRecordById, updateRecord, deleteRecord };
