const mongoose = require('mongoose');
const schema = mongoose.Schema;
const panicHistory = new schema({
    alert_id: { type: String },
    alert_type: { type: String, enum: ['Arrest', 'Crime', 'Medical Emergency', 'Accident'] },
    panic_initiation_location: { type: String },
    panic_initiation_longitude: { type: Object },
    panic_initiation_latitude: { type: Object },
    panic_ending_longitude: { type: String },
    panic_ending_latitude: { type: Object },
    status: { type: String },
    client_state: { type: String },
    client_country: { type: String },
    client_phonenumber: { type: String },
    lawyer_phonenumber: { type: String },
    client_name: { type: String },
    lawyer_name: { type: String },
    resolved: { type: Boolean, default: false },
    client_email: { type: String },
    lawyer_email: { type: String },
    client_id: { type: String },
    lawyer_id: { type: String },
    client_img_url: { type: String },
    lawyer_img_url: { type: String },
    lawyer_latitude: { type: String },
    lawyer_longitude: { type: String },
    client_location: {
        local_address: { type: String },
        place_id: { type: String },
        latitude: { type: String },
        longitude: { type: String }
    },
    lawyer_location: {
        local_address: { type: String },
        place_id: { type: String },
        latitude: { type: String },
        longitude: { type: String }
    }
}, { timestamps: true });

module.exports = mongoose.model('panicHistory', panicHistory);