
const mongoose = require('mongoose');
const schema = mongoose.Schema;

var UserTokenScheam = new schema({
    userId:{ type:mongoose.SchemaTypes.ObjectId, ref: 'users', autopopulate: true },
    tokenID: {type: String, default: null},
    deviceID: {type: String, default: null},
    softDelete:{type:Boolean , default: false },
}, {timestamps : { currentTime : () => Math.floor(Date.now() / 1000)}})

module.exports = mongoose.model('userToken', UserTokenScheam)
