const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    title: { 
        type: String, 
         },
    content: { 
        type: String, 
        required: true },
    FromUser:{
        type: Boolean
    }
}, {
  timestamps: true
});

module.exports = messageSchema;
