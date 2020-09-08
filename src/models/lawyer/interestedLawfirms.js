var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var interested_firmsSchema = new Schema({
    matter_id: { type: mongoose.SchemaTypes.ObjectId, ref: "matter", index: true, autopopulate: true },
    user_detail: { type: mongoose.SchemaTypes.ObjectId, ref: "user", autopopulate: true, index: true },
    date_indicated: { type: Date, default: new Date() },
    firm_detail: { type: mongoose.SchemaTypes.ObjectId, ref: "lawFirm", index: true, autopopulate: true },
    status: { type: Boolean, default: false },
    public_id: { type: mongoose.SchemaTypes.ObjectId },
    ignore: { type: Boolean, default: false },

}, { timestamps: true })


module.exports = mongoose.model('interested_firms', interested_firmsSchema);