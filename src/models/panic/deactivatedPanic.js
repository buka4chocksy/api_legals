
const mongoose = require('mongoose');
const schema = mongoose.Schema;

const deactivatedPanicSchema = new schema({
    alert_id: {type:String},
    alert_type: {type:String},
    client_id: { type: String },
    reason: {type: String}
})

module.exports = mongoose.model('deactivatedPanicSchema', deactivatedPanicSchema);
