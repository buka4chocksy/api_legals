const mongoose = require('mongoose');
const schema = mongoose.Schema;
const pannicHistory = new schema({
    alert_type: {type:String , required:true},
    location_initiated: {type: Object},
    location_ended: {type: Object},
    status: {type: String},
    client_phonenumber: {type: String},
    client_email: {type: String},
    client_name :{type:String},
    resolved:{type:String, required:true},
    email_address:{type:String , required:true},
    relationship:{type:String , required:true},
    user_type:{type:String , required:true},
    client_id: { type: String },
    lawyer_id: { type: String }
}, {timestamps: true})

module.exports =  mongoose.model('pannicButton' , pannicHistory)