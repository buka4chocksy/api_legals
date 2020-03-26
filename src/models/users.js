const mongoose = require('mongoose');
const schema = mongoose.Schema;
const userSchema = new schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email_address: { type: String, required: true, unique: true },
    phone_number: { type: String, required: true },
    image_url: { type: String, default: '' },
    image_id: { type: String, default: '' },
    status_code: { type: Number },
    gender: { type: String },
    password: { type: String, required: true },
    user_type: { type: String, required: true },
    status: { type: Boolean, default: false },
    public_id: { type: mongoose.SchemaTypes.ObjectId },
    created_at: { type: Date, default: Date.now },
})

module.exports = mongoose.model('users', userSchema);