const mongoose = require('mongoose');
const schema = mongoose.Schema;
const pannicButtonSchema = new schema({
    next_of_kin:{type:String , required:true},
    country_code:{type:String, required:true},
    phone_number:{type:String, required:true},
    email:{type:String , required:true},
    relationship:{type:String , required:true},
    user_type:{type:String , required:true},
    alert:{type:String},
    public_id: { type: mongoose.SchemaTypes.ObjectId }
})

module.exports =  mongoose.model('pannicButton' , pannicButtonSchema)