const mongoose = require('mongoose');
const schema = mongoose.Schema;
const lawFirmSchema = new schema({
    name_of_firm:{type:String , required:true},
    contact_email:{type:String , required:true},
    contact_phone_number:[{
        phone_number:{type:String , require:true}
    }],
    practice_area: [{
        practice_area_id: { type: mongoose.SchemaTypes.ObjectId, ref: 'practiceArea', autopopulate: true }
    }],
    practitioner: [{
        practitioner_name: { type: String , require:true}
    }],
    country: [{
        country_name: { type: String , require:true}
    }],
    state: [{
        state_name: { type: String , require:true}
    }],
    address: [{
        address_name: { type: String , require:true}
    }],
    lawyer_id:{ type: mongoose.SchemaTypes.ObjectId, ref: 'users', autopopulate: true },
    created_at: { type: Date, default: Date.now },

})
module.exports = mongoose.model('lawFirm', lawFirmSchema);