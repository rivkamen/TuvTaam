const mongoose = require('mongoose');
const messageSchema = require('../models/Message');

const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    userId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }],
      
    // adminId:{
    //       type: mongoose.Schema.Types.ObjectId, ref: 'Admin'//, required: true 
        
    //     },
        title: { 
          type: String 
           },
    messages: [messageSchema],     
    
 
},
    
{
    timestamps:true
    });

module.exports = mongoose.model('Session', sessionSchema);


