const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recordSchema = new Schema({
    recordName:{
        type:String,
        required: true
    },
    type:{
        type: String, enum: ["t", "n", "c"], required: true
    },
    belonging:{
        type: String, enum: ["1.1","1.2","1.3","1.4","1.5","1.6","1.7","1.8","1.9","1.10","1.11","1.12","2.1","2.2","2.3","2.4","2.5","2.6","2.7","2.8","2.9","2.10","2.11","3.1","3.2","3.3","3.4","3.5","3.6","3.7","3.8","3.9","3.10","4.1","4.2","4.3","4.4","4.5","4.6","4.7","4.8","4.9","4.10","5.1","5.2","5.3","5.4","5.5","5.6","5.7","5.8","5.9","5.10","5.11","7.1","7.2","7.3","7.4","7.5","7.6","7.7","7.8","7.9","7.10"], required: true
    },
    IsSpecial:{
        type:Boolean,
        default:false
    },
    path:{
        type:String,
        required:true

    }
    
},
    
{
    timestamps:true
    });

module.exports = mongoose.model('Record', recordSchema);




