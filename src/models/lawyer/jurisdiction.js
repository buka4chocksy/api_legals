const mongoose = require('mongoose');
const schema = mongoose.Schema;
const jurisdiction_schema = new schema({
    _id : {type : mongoose.Types.ObjectId},
    name: { type: String, required: true },
    code : {type : String},
    state : [{}],
    phone : {type : String},
    flag : {type : String}
})
module.exports = mongoose.model('jurisdiction', jurisdiction_schema)