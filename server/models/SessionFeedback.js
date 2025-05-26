const mongoose = require('mongoose');
const testRecordSchema = require('../models/TestRecord');

const sessionfeedbackSchema = new mongoose.Schema({
      userId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }],
        title: { 
          type: String 
           },
    messages: [testRecordSchema],     
    
}, {
  timestamps: true
});
module.exports = mongoose.model('SessionFeedback', sessionfeedbackSchema);


