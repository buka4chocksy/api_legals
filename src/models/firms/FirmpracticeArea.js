const mongoose = require('mongoose');
const schema = mongoose.Schema;

var FirmpracticeAreaSchema = new schema({
    firm : {type : mongoose.SchemaTypes.ObjectId, required : true, ref : 'firm'},
    practice_area: { type: mongoose.SchemaTypes.ObjectId, ref: 'practiceArea', autopopulate: true },
    softDelete:{type:Boolean , default: false },

}, {timestamps : { currentTime : () => Math.floor(Date.now() / 1000)}})

module.exports = mongoose.model('firmpracticeArea', FirmpracticeAreaSchema)



