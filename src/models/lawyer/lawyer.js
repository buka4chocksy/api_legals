const mongoose = require('mongoose');
const schema = mongoose.Schema;
const lawyerSchema = new schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email_address: { type: String, required: true, unique: true },
    phone_number: { type: String, required: true },
    image_url: { type: String, default: '' },
    image_id: { type: String, default: '' },
    softDelete: { type: Boolean, default: false },
    user_type: { type: String, default: 'lawyer' },
    public_id: { type: mongoose.SchemaTypes.ObjectId },
    profileSummary: { type: String, default: '' },
    gender: { type: String, default: '' }
});



module.exports = mongoose.model('lawyer', lawyerSchema);

