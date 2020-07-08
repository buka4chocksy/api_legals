const mongoose = require('mongoose');
const schema = mongoose.Schema;
const clientSchema = new schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email_address: { type: String, required: true, unique: true },
    phone_number: { type: String, required: true },
    image_url: { type: String, default: '' },
    image_id: { type: String, default: '' },
    softDelete:{type:Boolean , default: false },
    gender: { type: String , default:''},
    occupation:{type:String ,default:''},
    country:{type:String ,default:''},
    state_of_origin:{type:String , default:''},
    education: [{
        institution: { type: String, default: '' },
        degree:{ type: String, default: '' },
        qualification:{ type: String, default: '' },
        yearFrom:{ type: Date, default: '' },
        yearTo:{ type: Date, default: '' },
     }],
     experience: [{
         organisation: { type: String, default: '' },
         role:{ type: String, default: '' },
         workHighlight:{ type: String, default: '' },
         honours:{ type: String, default: '' },
         yearFrom:{ type: Date, default: '' },
         yearTo:{ type: Date, default: '' },
      }],
      profileSummary:{type:String , default:''},
    user_type: { type: String, required: true },
    public_id: { type: mongoose.SchemaTypes.ObjectId },
})

module.exports = mongoose.model('client', clientSchema);
