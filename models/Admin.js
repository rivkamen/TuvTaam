const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
  username: { 
            type: String, 
            required: true,
             },
  password: { 
            type: String, 
            required: true },
  email: { 
            type: String, 
            unique:true

            },
  
},
    
{
    timestamps:true
    });

module.exports = mongoose.model('Admin', adminSchema);
