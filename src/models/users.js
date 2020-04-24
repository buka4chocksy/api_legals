const mongoose = require('mongoose');
const schema = mongoose.Schema;
const userSchema = new schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email_address: { type: String, required: true, unique: true },
    phone_number: { type: String, required: true },
    status_code: { type: Number },
    gender: { type: String },
    terms:{type:Boolean , default:false},
    password: { type: String, required: true },
    user_type: { type: String, required: true },
    terms:{type:Boolean ,  default: false},
    status: { type: Boolean, default: false },
    public_id: { type: mongoose.SchemaTypes.ObjectId },
    created_at: { type: Date, default: Date.now },
})

module.exports = mongoose.model('users', userSchema);
