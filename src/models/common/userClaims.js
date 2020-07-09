const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var UserClaim = new Schema({
    User : {type : mongoose.SchemaTypes.ObjectId, required : true, ref : 'user'},
    claim : {type : mongoose.SchemaTypes.ObjectId, required : true, ref : 'claim'}
}, {timestamps : { currentTime : () => Math.floor(Date.now() / 1000)}});

module.exports = mongoose.model('userclaim', UserClaim);