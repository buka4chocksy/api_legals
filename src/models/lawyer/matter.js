var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var matterSchema = new Schema({
    title: { type: String, required: [true, "matter title  not available"] },
    case_owner: {
        user_detail: { type: mongoose.SchemaTypes.ObjectId, autopopulate: true, index: true },
        publicId: { type: mongoose.SchemaTypes.ObjectId , autopopulate: true, index: true },
        name: { type: String, lowercase: true },
        user_type: { type: String, lowercase: true },
    },
    deadline: {
        type: String, required: [true, "Time limit not provided"]
        // validate: { msg: "time limit can't be less than today", validator: validateReportDate }
    },
    matter_description: { type: String, required: [true, "case instruction  not available"] },
    specified_practiceareas: [{
        practiceArea_id: { type: mongoose.SchemaTypes.ObjectId, ref: "practiceArea" }
    }],
    location: {
        place_id: { type: String, default: "" },
        local_address: { type: String },
        latitude: { type: String, default: "" },
        longitude: { type: String, default: "" },
    },
    case_files: [{
        case_file_url: { type: String },
        case_file_secure_url: { type: String },
        case_file_id: { type: String },
        case_file_delete_token: { type: String },
        case_file_resource_type: { type: String },
        case_file_public_id: { type: String },
        case_file_name: { type: String },
        case_file_mime_type: { type: String },
        created_on: { type: Date, default: new Date() },
    }],
    is_public: { type: Boolean, default: true },
    is_available: { type: mongoose.SchemaTypes.Boolean, default: true },
    specified_lawyer: {
        lawyer_detail: { type: mongoose.SchemaTypes.ObjectId, ref: "Lawyer", autopopulate: true },
        status: { type: Boolean, default: null }, //default to null when no reponse has been recieved
        publicId: { type: mongoose.SchemaTypes.ObjectId },
    },
    specified_firm: {
        firm_detail: { type: mongoose.SchemaTypes.ObjectId, ref: "lawFirm", autopopulate: true },
        status: { type: Boolean, default: null }, //default to null when no reponse has been recieved
        publicId: { type: mongoose.SchemaTypes.ObjectId },
    },
    assignedTo: {
        usertype: { type: String },
        lawyer: {
            owner: { type: mongoose.SchemaTypes.ObjectId, ref: "Lawyer", autopopulate: true },
            publicId: { type: mongoose.SchemaTypes.ObjectId }
        },
        firm: {
            owner: { type: mongoose.SchemaTypes.ObjectId, ref: "lawFirm", index: true, autopopulate: true },
            publicId: { type: mongoose.SchemaTypes.ObjectId }
        },
    },
}, { timestamps: true })



module.exports = mongoose.model('matter', matterSchema);