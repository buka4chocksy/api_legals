const mongoose = require('mongoose');
const schema = mongoose.Schema;
const ExperienceSchema = new schema({
    user : {type : mongoose.SchemaTypes.ObjectId, ref : "users"},
    public_id : {type : mongoose.SchemaTypes.ObjectId},
    organisation: { type: String, default: '' },
    role:{ type: String, default: '' },
    workHighlight:{ type: String, default: '' },
    honours:{ type: String, default: '' },
    yearFrom:{ type: Date, default: '' },
    yearTo:{ type: Date, default: '' },
}, { timestamps: true });



module.exports = mongoose.model('users', ExperienceSchema);