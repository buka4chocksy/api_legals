
const mongoose = require('mongoose');
const schema = mongoose.Schema;

const UserTokenSchema = new schema({
    user: { type: mongoose.SchemaTypes.ObjectId, required: true, ref: 'users' },
    phone_number: { type: String },
    public_id: { type: String },
    access_token: { type: String },
    expiry_time: { type: Date },
    refresh_count: { type: Number, default: 0, },
    callback_token: { type: String },
    last_login: { type: Date, default: Date.now() },
    token_type: { type: String, default: 'Bearer' },
    device_id: { type: String },
    is_browser: { type: String },
    soft_delete:{type:Boolean , default: false },
    ip_address : {type : String}
}, { timestamps: true, toObject : {getters : true} });





module.exports = mongoose.model('userToken', UserTokenSchema)
