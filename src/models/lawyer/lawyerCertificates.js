const mongoose = require('mongoose');
const schema = mongoose.Schema;
const LawyerJurisdictionSchema = new schema({
    user : {type : mongoose.SchemaTypes.ObjectId, ref : "users"},
    public_id : {type : mongoose.SchemaTypes.ObjectId},
    image_url : { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('users', LawyerJurisdictionSchema);