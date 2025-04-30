const mongoose = require('mongoose');

const sessionfeedbackSchema = new mongoose.Schema({
    
    userId:{
        type:mongoose.Schema.Types.ObjectId, ref: 'User',
         required: true 
    },
    feedback:[feedbackSchema],
    testRecord:[testRecordSchema]

    // AdminId:{
    //     type:mongoose.Schema.Types.ObjectId, ref: 'Admin',
    //      required: true 
    // }
}, {
  timestamps: true
});
module.exports = mongoose.model('SessionFeedback', sessionfeedbackSchema);


