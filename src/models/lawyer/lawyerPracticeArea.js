const mongoose = require('mongoose');
const schema = mongoose.Schema;
const LawyerPracticeAreaSchema = new schema({
    user : {type : mongoose.SchemaTypes.ObjectId, ref : "users"},
    public_id : {type : mongoose.SchemaTypes.ObjectId},
    practice_area : {type : mongoose.SchemaTypes.ObjectId, ref : "practiceArea"}
}, { timestamps: true, toObject : {getters : true}});

// LawyerPracticeAreaSchema.set('toObject', { getters: true });



module.exports = mongoose.model('lawyerpracticearea', LawyerPracticeAreaSchema);