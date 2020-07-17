const mongoose = require('mongoose');
const schema  = mongoose.Schema;

const NextOfKinSchema = new schema({
    user : {type : mongoose.SchemaTypes.ObjectId, ref : "user"},
    public_id : {type : mongoose.SchemaTypes.ObjectId},
    full_name : {type :  String, required : true},
    phone_number : {type : String, required : true},
    email_address : {type : String},
    relationship : {type : String, enum :["Mother", "Father", "Wife", "Husband", "Child", "Brother", "Sister", "Cousin", "Others"]},
    next_of_kin_id: {type: mongoose.SchemaTypes.ObjectId, default: null},
    next_of_kin: {type:  mongoose.SchemaTypes.ObjectId, type : mongoose.SchemaTypes.ObjectId, ref : "user" }
}, {timestamps : true, toObject : {getters : true}});

module.exports = mongoose.model("nextofkin", NextOfKinSchema);