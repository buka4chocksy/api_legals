const model = require('../models/client');
const user = require('../models/users');
//profile picture update
exports.profilePicture = (id, data) => {
    return new Promise((resolve, reject) => {
        const detail = {
            image_url: data.imageUrl,
            image_id: data.imageID
        }
        model.findOneAndUpdate({ public_id: id }, detail).exec((err, updated) => {
            if (err) reject(err);
            if (updated) {
                resolve({ success: true, message: 'profile picture updated ' })
            } else {
                resolve({ success: false, message: 'Error updating profile picture' })
            }
        })
    })
}

//update client edit profile
exports.editClientProfile = (id, data) => {
    return new Promise((resolve, reject) => {
        const details = {
            gender: data.gender,
            country: data.country,
            occupation:data.occupation,
            state_of_origin: data.state_of_origin
        }
        model.findOneAndUpdate({ public_id: id }, details).exec((err, update) => {
            if (err) reject(err);
            if (update) {
                resolve({ success: true, message: 'client Profile updated !!!' })
            } else {
                resolve({ success: false, message: 'error updating client profile!!!' })
            }
        })
    })
}

//delete client account
exports.deleteAccount = (id , publicId) => {
    return new Promise((resolve, reject) => {
        model.findOneAndRemove({ public_id: publicId }).exec((err, deleted) => {
            if (err) reject(err);
            if (deleted) {
                user.findByIdAndDelete({ _id: id }).exec((err, done) => {
                    if (err) reject(err);
                    if (done) {
                        resolve({ success: true, message: 'account deleted' })
                    } else {
                        resolve({ success: false, message: 'error deleting account !!!' })
                    }
                })
            } else {
                resolve({ success: false, message: 'error deleting account !!!' })

            }
        })
    })
}

exports.getClientProfile = (publicId)=>{
    return new Promise((resolve ,reject)=>{
        model.findOne({public_id:publicId}).exec((err , client)=>{
            if(err)reject(err);
            if(client){
                resolve({success:true , message:'client profile', data:client})
            }else{
                resolve({success:false , message:'could not find client details'})
            }
        })
    })
}