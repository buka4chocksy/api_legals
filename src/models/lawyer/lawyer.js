const mongoose = require('mongoose');
const schema = mongoose.Schema;
const lawyerSchema = new schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email_address: { type: String, required: true, unique: true },
    phone_number: { type: String, required: true },
    image_url: { type: String, default: '' },
    image_id: { type: String, default: '' },  
<<<<<<< HEAD
    user_type: { type: String, required: true, lowercase: true },
=======
    softDelete:{type:Boolean , default: false },
    user_type: { type: String, default : 'lawyer' },
>>>>>>> 659636ab2a1fea6bc404f95a624f476cd04d192f
    public_id: { type: mongoose.SchemaTypes.ObjectId },
    enrollment_number: { type: String, default: '' },
    practice_area: [{
        practice_area_id: { type: mongoose.SchemaTypes.ObjectId, ref: 'practiceArea', autopopulate: true }
    }],
    jurisdiction: [{
        jurisdiction_id: { type: mongoose.SchemaTypes.ObjectId, ref: 'jurisdiction', autopopulate: true }
    }],
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
    law_certificates: [{
        image_url: { type: String, default: '' },
    }],
    country: { type: String, default: '' },
    state_of_origin: { type: String, default: '' },
    gender: { type: String, default: '' }

})



module.exports = mongoose.model('lawyer', lawyerSchema);

