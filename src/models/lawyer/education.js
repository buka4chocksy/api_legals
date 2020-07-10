const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const schema = mongoose.Schema;

const educationSchema = new schema({
    public_id: { type: mongoose.SchemaTypes.ObjectId },
    education_history: [{
        school: { type: String },
        from: { type: String },
        to: { type: String },
        organisation: { type: String },
        awards: { type: Array }
    }],
}, {timestamps : true, toObject : {getters : true}})

module.exports = mongoose.model('education', educationSchema);