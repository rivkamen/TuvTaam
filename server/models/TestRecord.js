const mongoose = require('mongoose');

const testRecordSchema = new mongoose.Schema({
    

    content: { 
        type: String, 
    },
    fromUser:{
        type: Boolean
    },
    path:
    {
        type: String, 
    },
    isRead: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});
module.exports = testRecordSchema;



