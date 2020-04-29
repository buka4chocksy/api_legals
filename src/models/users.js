const mongoose = require('mongoose');
const schema = mongoose.Schema;
const userSchema = new schema({
    first_name: { type: String },
    last_name: { type: String },
    oauthID: { type: String },
    name: { type: String },
    email_address: { type: String, unique: true },
    phone_number: { type: String },
    image_url: { type: String, default: '' },
    image_id: { type: String, default: '' },
    status_code: { type: Number },
    password: { type: String },
    user_type: { type: String },
    status: { type: Boolean, default: false },
    public_id: { type: mongoose.SchemaTypes.ObjectId },
    created_at: { type: Date, default: Date.now },
})

module.exports = mongoose.model('User', userSchema);