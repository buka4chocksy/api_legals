const mongoose = require('mongoose');
const schema = mongoose.Schema;
const lawyerSchema = new schema({
    user_id: { type: mongoose.SchemaTypes.ObjectId, ref: 'users', autopopulate: true },
    public_id: { type: mongoose.SchemaTypes.ObjectId },
    enrollment_number: { type: String, default: '' },
    practice_area: [{
        practice_area_id: { type: mongoose.SchemaTypes.ObjectId, ref: 'practiceArea', autopopulate: true }
    }],
    jurisdiction: [{
        jurisdiction_id: { type: mongoose.SchemaTypes.ObjectId, ref: 'jurisdiction', autopopulate: true }
    }],
    law_certificates: [{
        image_url: { type: String, default: '' },
    }],
    country: { type: String, default: '' },
    state_of_origin: { type: String, default: '' },
    gender: { type: String, default: '' }

})



module.exports = mongoose.model('lawyer', lawyerSchema);