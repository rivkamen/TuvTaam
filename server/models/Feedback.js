const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
   
    content: { 
        type: String,
        required:true 
    },
    path:
    {
        type: String, 
    }

}, {
  timestamps: true
});
module.exports = feedbackSchema;


