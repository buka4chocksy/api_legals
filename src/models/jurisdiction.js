const mongoose = require('mongoose');
const schema = mongoose.Schema;
const jurisdiction_schema = new schema({
    name:{type:String , required:true}
})
module.exports = mongoose.model('jurisdiction', jurisdiction_schema)