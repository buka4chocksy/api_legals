const mongoose = require('mongoose');
const jurisdictionModel = require('./jurisdiction');
const schema = mongoose.Schema;
const LawyerJurisdictionSchema = new schema({
    user : {type : mongoose.SchemaTypes.ObjectId, ref : "users"},
    public_id : {type : mongoose.SchemaTypes.ObjectId},
    jurisdiction_id: { type: mongoose.Types.ObjectId, ref: 'jurisdiction'},
    year: {type : String, default : null},
    enrolment_number : {type : String, default : null},
    certificate : [{
        certificate_url : {type : String},
        certificate_secure_url : {type : String},
        certificate_id : {type : String},
        certificate_delete_token : {type: String},
        certificate_resource_type : {type : String},
        certificate_public_id : {type :String}
    }],
    verified : {type : Boolean, default : null}
}, { timestamps: true });

module.exports = mongoose.model('lawyerjurisdiction', LawyerJurisdictionSchema);