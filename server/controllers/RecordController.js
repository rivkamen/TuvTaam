const Record = require('../models/Record');

// פונקציה להוספת הקלטה חדשה
const createRecord = async (req, res) => {
  try {
    const { recordName, type, belonging, IsSpecial, path } = req.body;

    const newRecord = new Record({
      recordName,
      type,
      belonging,
      IsSpecial,
      path,
    });

    await newRecord.save();
    return res.status(201).json({ message: 'Record created successfully', record: newRecord });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// פונקציה לקריאת כל ההקלטות
const getAllRecords = async (req, res) => {
  try {
    const records = await Record.find();
    return res.status(200).json(records);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// פונקציה לקריאת הקלטה לפי ID
const getRecordById = async (req, res) => {
  try {
    const { _id } = req.params;
    const record = await Record.findById(_id);

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    return res.status(200).json(record);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// פונקציה לעדכון הקלטה לפי ID
const updateRecord = async (req, res) => {
  try {
    const { _id } = req.params;
    const { recordName, type, belonging, IsSpecial, path } = req.body;

    const record = await Record.findById(_id);

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    record.recordName = recordName || record.recordName;
    record.type = type || record.type;
    record.belonging = belonging || record.belonging;
    record.IsSpecial = IsSpecial !== undefined ? IsSpecial : record.IsSpecial;
    record.path = path || record.path;

    await record.save();

    return res.status(200).json({ message: 'Record updated successfully', record });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// פונקציה למחיקת הקלטה לפי ID
const deleteRecord = async (req, res) => {
  try {
    const { _id } = req.params;
    const record = await Record.findById(_id);

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    await record.remove();

    return res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createRecord, getAllRecords, getRecordById, updateRecord, deleteRecord };
