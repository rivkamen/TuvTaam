const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
   
    content: { 
        type: String, 
        required: true },
    fromUser:{
        type: Boolean
    }
}, {
  timestamps: true
});

module.exports = messageSchema;
