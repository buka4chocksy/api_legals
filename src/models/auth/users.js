
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const schema = mongoose.Schema;

const userSchema = new schema({
    first_name: { type: String },
    last_name: { type: String },
    name: { type: String },
    email_address: { type: String, unique: true },
    phone_number: { type: String },
    image_url: { type: String, default: '' },
    image_id: { type: String, default: '' },
    status_code: { type: Number },
    softDelete:{type:Boolean , default: false },
    blocked: {type:Boolean , default: false},
    hoax_alert: {type: Number, default: 0},
    password: { type: String },
    user_type: { type: String, lowercase: true },
    softDelete:{type:Boolean , default: false },
    status: { type: Boolean, default: false },
    public_id: { type: mongoose.SchemaTypes.ObjectId },
    created_at: { type: Date, default: Date.now },
    oauth: {
        provider: {type: String, enum: ['google', 'linkedin']},
        oauthID: {type: String},
        status: false
    }
})

userSchema.methods.comparePassword = function(password) {
    var result = bcrypt.compareSync(password, this.password);
    return result;
}


module.exports = mongoose.model('users', userSchema);
