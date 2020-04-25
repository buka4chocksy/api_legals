const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    oauthID: String,
    name: String,
    profileImage: String,
    created: Date
})

module.exports = mongoose.model('User', UserSchema);