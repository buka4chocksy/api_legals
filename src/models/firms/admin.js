const mongoose = require('mongoose');
const schema = mongoose.Schema;

var AdminSchema = new schema({
    firm : {type : mongoose.SchemaTypes.ObjectId, required : true, ref : 'firm'},
    lawyer : {type : mongoose.SchemaTypes.ObjectId, required : true, ref : 'lawyer'},
    softDelete:{type:Boolean , default: false },
}, {timestamps : { currentTime : () => Math.floor(Date.now() / 1000)}})

module.exports = mongoose.model('admin', AdminSchema)



