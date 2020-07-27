const UserModel = require('../../models/auth/users');
const AvatarModel = require('../../models/common/userAvatar');
const userSettings = require('../../models/common/userSettings')
const {applyPatch} =require('fast-json-patch');
const {uploadToCloud, deleteFromCloud} = require('../../utils/cloudinaryUtil');

const updateUserDetails = (public_id, patchDetail = []) => {
    return new Promise((resolve, reject) => {
        UserModel.findOne({public_id : public_id}).select({phone_number : 1, gender : 1}).exec((err, foundUser) => {
            if(err){
                //log error message here
            }
            else if(!foundUser){resolve({success : false, message : "user not found", data : null, status : 404})}
            else{
                let patchedDocument = applyPatch(foundUser.toObject(), patchDetail);
                   UserModel.findOneAndUpdate({public_id : public_id}, patchedDocument.newDocument, {new : true, upsert : true, 
                    select : {password : 0, _id : 0,
                     createdAt : 0, updatedAt : 0,softDelete : 0,  }}).exec((error, patchedUser) =>{ 
                    if(error || !patchedUser){
                        //log error
                        resolve({success : false, message : "could not update user details", data : null, status : 400});
                    }else{
                        resolve({success : true, message : "user details updated", data : patchedUser, status : 200});
                    }
                })
            }
        })
    });
}

const updateUserAvatar = (public_id, file) => {
    return new Promise((resolve, reject) =>{
        UserModel.findOne({public_id : public_id}).select({image_url : 1, image_id : 1,_id: 1}).exec(async(err, foundUser) => {
            if(err){
                //log error message here
                resolve({success : false, message : "user not found", data : null, status : 404})
            }
            else if(!foundUser){resolve({success : false, message : "user not found", data : null, status : 404})}
            else{
                var cloudResult = await uploadToCloud(file.path, "avatar");
                if(!cloudResult){resolve({success : false, message : "could not save avatar", data : null, status : 400})}
                else {
                    avatar_detail = {
                        avatar_url: cloudResult.url,
                        avatar_secure_url: cloudResult.secure_url,
                        avatar_id: cloudResult.asset_id,
                        avatar_delete_token: cloudResult.delete_token,
                        avatar_resource_type: cloudResult.resource_type,
                        avatar_public_id: cloudResult.public_id,
                        avatar_name: file.originalname,
                        avatar_mime_type: file.mimetype,
                        user : foundUser.id,
                        public_id : public_id
                    };
                    let updateData = {
                        image_url : cloudResult.secure_url,
                        image_id : cloudResult.asset_id
                    }
                    UserModel.findOneAndUpdate({public_id : public_id}, updateData).exec((error, updatedData) => {
                        if(error || !updatedData){
                            //log error
                            resolve({success : false, message : "could not update user details", data : null, status : 400});
                        }else{
                            resolve({success : true, message : "user details updated", data : cloudResult.secure_url, status : 200});
                        }
                        updateUserAvaterInDatabase(public_id, avatar_detail);
                    })
                    
                }
            }
            })
    })
}

const updateUserAvaterInDatabase = (public_id, avatarDetails) => {
return    AvatarModel.findOne({public_id : public_id}).exec((err, foundData) => {
        if(!foundData){
           return AvatarModel.create(avatarDetails);
        }else{
            deleteFromCloud(foundData.avatar_public_id);
            return AvatarModel.findOneAndUpdate({public_id : public_id}, avatarDetails, {upsert : true, new : true});
        }
    })
 
}

const addDeviceId = (public_id, user_id, device_id) => {
    return new Promise((resolve, reject) => {
        userSettings.findOneAndUpdate({ public_id: public_id}, {$set: {user: user_id, device_id: device_id}}, {new: true, upsert: true}).exec((err, found) => {
            if (err) reject({ success: false, message: err, status: 500 });

            resolve({ success: true, message: 'New device id added', status: 200 })
        })
    })
}




module.exports = {
    updateUserDetails, updateUserAvatar, addDeviceId
}