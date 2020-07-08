const mongoose = require('mongoose')
const schema = mongoose.Schema;
const recommendationSchema = new schema({
    lawyerId:{type:mongoose.Types.ObjectId , ref:'lawyer',  autopopulate: true },
    clientId:{type:mongoose.Types.ObjectId , ref:'client',  autopopulate: true },
    message:{type:String , required:true}
})

module.exports = mongoose.model("recommendation", recommendationSchema)