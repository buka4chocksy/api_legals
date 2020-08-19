const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const schema = mongoose.Schema;

const educationSchema = new schema({
    public_id: { type: mongoose.SchemaTypes.ObjectId },
    school: { type: String },
    start_year: { type: String },
    end_year: { type: String },
    organization: { type: String },
    awards : {type : String}
}, { timestamps: true, toObject: { getters: true } });

module.exports = mongoose.model('education', educationSchema);