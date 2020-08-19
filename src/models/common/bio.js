const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const schema = mongoose.Schema;

const bioSchema = new schema({
    public_id: { type: mongoose.SchemaTypes.ObjectId },
    profile_summary: { type: String },
    more_details: { type: mongoose.SchemaTypes.Mixed },
}, {timestamps : true, toObject : {getters : true}})

module.exports = mongoose.model('bio', bioSchema);