const mongoose = require('mongoose');
const schema = mongoose.Schema;

var Claims = new schema({
    Name : {type : String, required : true},
    privilege : {type : String, required : true},
    controller : {type : String, required : true},
    action : {type : String, required : true}
}, {timestamps : { currentTime : () => Math.floor(Date.now() / 1000)}})


module.exports = mongoose.model('claim', Claims)