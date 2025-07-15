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
  },
  isDeleted: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
    type: {
        type: String,
        enum: ['text', 'rich'],
        default: 'text'
    }
}, {
  timestamps: true
});
module.exports = testRecordSchema;



