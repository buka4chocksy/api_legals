const mongoose = require('mongoose');
const schema = mongoose.Schema;
const EducationSchema = new schema({
    user : {type : mongoose.SchemaTypes.ObjectId, ref : "users"},
    public_id : {type : mongoose.SchemaTypes.ObjectId},
    institution: { type: String, default: '' },
    degree: { type: String, default: '' },
    qualification: { type: String, default: '' },
    yearFrom: { type: Date, default: '' },
    yearTo: { type: Date, default: '' },
}, { timestamps: true });



module.exports = mongoose.model('users', EducationSchema);