const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const schema = mongoose.Schema;

const userSchema = new schema({
    first_name: { type: String },
    last_name: { type: String },
    name: { type: String },
    email_address: { type: String, unique: true },
    phone_number: { type: String },
    image_url: { type: String, default: '' },
    image_id: { type: String, default: '' },
    status_code: { type: Number, default :  Math.floor(1000 + Math.random() * 9000) },
    softDelete:{type:Boolean , default: false },
    blocked: {type:Boolean , default: false},
    hoax_alert: {type: Number, default: 0},
    password: { type: String },
    user_type: { type: String, lowercase: true, enum:["lawyer", "client", "student"] },
    softDelete:{type:Boolean , default: false },
    status: { type: Boolean, default: true },
    public_id: { type: mongoose.SchemaTypes.ObjectId, default : mongoose.Types.ObjectId() },
    terms_accepted : {type : Boolean, default : null},
    is_complete : {type : Boolean, default : false},
    oauth: {
        provider: {type: String, enum: ['google', 'linkedin']},
        oauthID: {type: String},
        status: false
    }
}, {timestamps : true, toObject : {getters : true}})

userSchema.pre('save', function() {
    if(this.password){
     this.password =    bcrypt.hashSync(this.password, 10)
    }
})

userSchema.methods.comparePassword = function(password){
    console.log("comparing password", password);
    return  bcrypt.compareSync(password, this.password)
}


module.exports = mongoose.model('users', userSchema);
