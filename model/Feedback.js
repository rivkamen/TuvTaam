const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    
    content: { 
        type: String, 
        required: true 
    },
    UserId:{
        type:mongoose.Schema.Types.ObjectId, ref: 'User',
         required: true 
    },
    // AdminId:{
    //     type:mongoose.Schema.Types.ObjectId, ref: 'Admin',
    //      required: true 
    // }
}, {
  timestamps: true
});

module.exports = feedbackSchema;

