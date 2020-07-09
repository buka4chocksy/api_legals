const mongoose = require('mongoose');
const schema = mongoose.Schema;

var FirmLawyersSchema = new schema({
    firm : {type : mongoose.SchemaTypes.ObjectId, required : true, ref : 'firm'},
    softDelete:{type:Boolean , default: false },
    lawyer : {type : mongoose.SchemaTypes.ObjectId, required : true, ref : 'lawyer'},
}, {timestamps : { currentTime : () => Math.floor(Date.now() / 1000)}})

module.exports = mongoose.model('firmlawyers', FirmLawyersSchema)



