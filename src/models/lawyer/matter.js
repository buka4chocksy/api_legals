var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var matterSchema = new Schema({
    lawyer: {
        Lawyer: { type: mongoose.SchemaTypes.ObjectId, ref: "Lawyer", autopopulate: [true, "lawyer id  not available"] },
        publicId: { type: mongoose.SchemaTypes.ObjectId }
    },
    clientid: { type: mongoose.SchemaTypes.ObjectId, ref: "client", autopopulate: true, index: true },
    client_name: { type: String, lowercase: true },
    deadline: {
        type: Date, required: [true, "Time limit not provided"]
        // validate: { msg: "time limit can't be less than today", validator: validateReportDate }
    },
    Imagefile: [{
        imageUrl: { type: String, default: '' },
        created_on: { type: Date, default: new Date() },
    }],
    audiofile: [{
        audioUrl: { type: String, default: '' },
        created_on: { type: Date, default: new Date() },
    }],
    // fileId: { type: String, default: '' },
    matter_title: { type: String, required: [true, "matter title  not available"]},
    matter_description: { type: String, required: [true, "case instruction  not available"]},
    dateadded: { type: Date, required: [true, "date case was added not available"], default: new Date() },
    status: { type: mongoose.SchemaTypes.Boolean, default: null },
    country:  { type: mongoose.SchemaTypes.ObjectId, ref: "jurisdiction", autopopulate: true },
    state: { type: mongoose.SchemaTypes.ObjectId, ref: "jurisdiction", autopopulate: true },
    practiceArea: [{
        practiceArea_id:    { type: mongoose.SchemaTypes.ObjectId, ref: "practiceArea" }
    }],
    public: { type: Boolean, default: true },
    interestedLawyers: [
        {
            DateIndicated: { type: Date, default: new Date() },
            Lawyer: { type: mongoose.SchemaTypes.ObjectId, ref: "Lawyer", index: true, autopopulate: true },
            status: { type: Boolean, default: false },
            publicId: { type: mongoose.SchemaTypes.ObjectId },
            userType: { type: String, default: 'lawyer' },
            isfirm: { type: Boolean, default: false },
            firm: { type: mongoose.SchemaTypes.ObjectId, ref: "lawFirm", index: true, autopopulate: true }

        }
    ],
    specifiedLawyer: {
        Lawyer: { type: mongoose.SchemaTypes.ObjectId, ref: "Lawyer", autopopulate: true },
        status: { type: Boolean, default: null }, //default to null when no reponse has been recieved
        firm: { type: mongoose.SchemaTypes.ObjectId, ref: "lawFirm", autopopulate: true },
        publicId: { type: mongoose.SchemaTypes.ObjectId },
        isFirm: { type: Boolean, default: false }
    },
    completed: { type: Boolean, default: false },
    //this is for when a firm has been hired to handle a case, then use this.
    isFirm: { type: Boolean, default: false },
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
})


module.exports = mongoose.model('matter', matterSchema);