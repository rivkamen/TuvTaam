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
    }

}, {
  timestamps: true
});
module.exports = testRecordSchema;



