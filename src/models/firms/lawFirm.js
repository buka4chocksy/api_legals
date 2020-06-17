const mongoose = require('mongoose');
const schema = mongoose.Schema;
const lawFirmSchema = new schema({
    name_of_firm:{type:String , required:true},
    contact_email:{type:String , required:true},
    image_url: { type: String, default: '' },
    image_id: { type: String, default: '' },
    website_url: { type: String, default: '' },
    softDelete:{type:Boolean , default: false },
    contact_phone_number:[{
        phone_number:{type:String , require:true}
    }],
    location: [{
        country_Id: { type:  mongoose.SchemaTypes.ObjectId, ref: 'jurisdiction', autopopulate: true },
        state_Id: { type:  mongoose.SchemaTypes.ObjectId, ref: 'jurisdiction', autopopulate: true },
        address: { type: String , require:true}
    }],
    lawyer_id:{ type: mongoose.SchemaTypes.ObjectId, ref: 'lawyer', autopopulate: true },
    public_id:{ type: mongoose.SchemaTypes.ObjectId, ref: 'users', autopopulate: true },
    created_at: { type: Date, default: Date.now },

})
module.exports = mongoose.model('lawFirm', lawFirmSchema);
