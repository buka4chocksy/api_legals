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
            if (err) reject({err: err , status:500});
            if (updated) {
                resolve({ success: true, message: 'profile picture updated ' ,status:200})
            } else {
                resolve({ success: false, message: 'Error updating profile picture' , status:400 })
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
            if (err) reject({err: err , status:500});
            if (update) {
                resolve({ success: true, message: 'client Profile updated !!!', status:200 })
            } else {
                resolve({ success: false, message: 'error updating client profile!!!' , status:400})
            }
        })
    })
}

//delete client account
exports.deleteAccount = (id , publicId) => {
    return new Promise((resolve, reject) => {
        model.findOneAndRemove({ public_id: publicId }).exec((err, deleted) => {
            if (err) reject({err: err , status:500});
            if (deleted) {
                user.findByIdAndDelete({ _id: id }).exec((err, done) => {
                    if (err) reject({err: err , status:500});
                    if (done) {
                        resolve({ success: true, message: 'account deleted' , status:200})
                    } else {
                        resolve({ success: false, message: 'error deleting account !!!' ,status:400})
                    }
                })
            } else {
                resolve({ success: false, message: 'error deleting account !!!', status:400 })

            }
        })
    })
}

exports.getClientProfile = (publicId)=>{
    return new Promise((resolve ,reject)=>{
        model.findOne({public_id:publicId}).exec((err , client)=>{
            if(err)reject({err: err , status:500});
            if(client){
                resolve({success:true , message:'client profile', data:client , status:200})
            }else{
                resolve({success:false , message:'could not find client details' , status:400})
            }
        })
    })
}