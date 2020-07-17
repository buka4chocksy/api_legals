const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AvatarSchema = new Schema({
    user : {type : mongoose.Types.ObjectId, ref : 'user'},
    public_id : {type : mongoose.Types.ObjectId},
    avatar_url : {type : String},
    avatar_secure_url : {type : String},
    avatar_id : {type : String},
    avatar_delete_token : {type: String},
    avatar_resource_type : {type : String},
    avatar_public_id : {type :String},
    avatar_name: {type :String},
    avatar_mime_type: {type :String}
});


module.exports = mongoose.model("user_avatar", AvatarSchema);