const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var UserSettings = new Schema({
    user : {type : mongoose.SchemaTypes.ObjectId, required : true, ref : 'user'},
    public_id : {type : mongoose.SchemaTypes.ObjectId},
    device_id : {type : String}
}, {timestamps : { currentTime : () => Math.floor(Date.now() / 1000)}});

module.exports = mongoose.model('usersetting', UserSettings);