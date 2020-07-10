const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const schema = mongoose.Schema;

const experienceSchema = new schema({
    public_id: { type: mongoose.SchemaTypes.ObjectId },
    organization: { type: String },
    role: { type: String },
    work: {type: String},
    awards: {type: Array},
    from: {type: String},
    to: {type: String}
}, {timestamps : true, toObject : {getters : true}})

module.exports = mongoose.model('experience', experienceSchema);