const mongoose = require('mongoose');
const schema = mongoose.Schema;
const lawyerSchema = new schema({
user_id:{type: mongoose.SchemaTypes.ObjectId , ref:'user', autopopulate:true},
enrollment_number:{type:String},
practice_area:{type:mongoose.Types.ObjectId , ref:'practiceArea', autopopulate:true},
jurisdiction:{type:mongoose.Types.ObjectId , ref:'jurisdiction', autopopulate:true},
law_certificates:[{type:String}],
gender:{type:String, default: ''},

})

module.exports = mongoose.model('lawyer', lawyerSchema);