const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
   username: { 
            type: String, 
           required: true 
             },
    email: { 
            type: String, 
            required: true 

            },
    password: { 
                type: String, 
                required: true },
    /************************************************************************************* */
//     Parashot:{
// type:[string]
//     },
// /************************************************************************************* */

    adminId:{
    type: mongoose.Schema.Types.ObjectId, ref: 'Admin'//, required: true 
            
  }
},
    
{
    timestamps:true
    });

module.exports = mongoose.model('User', userSchema);

