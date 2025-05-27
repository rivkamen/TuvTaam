const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
   username: { 
            type: String, 
             },
    email: { 
            type: String, 
            required: true,
            unique:true


            },
    password: { 
                type: String, 
                required: true,
              },
    role:{
      type: String, enum: ["admin", "user"], default: "user", required: true
    }
      
},
    
{
    timestamps:true
    });

module.exports = mongoose.model('User', userSchema);

