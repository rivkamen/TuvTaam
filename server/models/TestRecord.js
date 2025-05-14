const mongoose = require('mongoose');

const testRecordSchema = new mongoose.Schema({
    

    content: { 
        type: String, 
    },
    nameOfParsha:{
        type:String,
        required:true
    },
    path:
    {
        type: String, 
        required:true
    }

}, {
  timestamps: true
});
module.exports = testRecordSchema;



