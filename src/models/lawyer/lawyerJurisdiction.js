const mongoose = require('mongoose');
const schema = mongoose.Schema;
const LawyerJurisdictionSchema = new schema({
    user : {type : mongoose.SchemaTypes.ObjectId, ref : "users"},
    public_id : {type : mongoose.SchemaTypes.ObjectId},
    jurisdiction_id: { type: mongoose.SchemaTypes.ObjectId, ref: 'jurisdiction'},
    enrollment_number : {type : String, default : null},
    certicicate : [{
        certicicate_url : {type : String},
        certicicate_secure_url : {type : String},
        certicicate_id : {type : String},
        certicicate_delete_token : {type: String},
        certicicate_resource_type : {type : String},
        certificate_public_id : {type :String}
    }]
}, { timestamps: true });

module.exports = mongoose.model('lawyerjurisdiction', LawyerJurisdictionSchema);