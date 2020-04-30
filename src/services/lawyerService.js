const model = require('../models/lawyer');
const user = require('../models/users')
const authService = require('../services/authService')

exports.completelawyerRegisteration = ( publicId, data , detail) => {
    return new Promise((resolve, reject) => {
        user.findOne({public_id:publicId}).exec((err , got)=>{
            if(err)reject(err)
            if(got){
                const details = {
                    first_name:got.first_name,
                    last_name:got.last_name,
                    email_address:got.email_address,
                    phone_number:got.phone_number,
                    public_id: publicId,
                    enrollment_number: data.enrollment_number,
                    user_type:data.user_type,
                    practice_area: [{
                    practice_area_id: data.practice_area
                    }],
                    jurisdiction: [{
                        jurisdiction_id: data.jurisdiction
                    }],
                    law_certificates: [{
                        image_url: detail.imageUrl
                    }]

                }
                model.findOne({ public_id: publicId }).exec((err, exists) => {
                    if (err) reject(err)
                    if (exists) {
                        resolve({ success: true, message: 'lawyer details already exists , please proceed to upload certificate' })
                    } else {
                            model.create(details).then(created => {
                                if (created) {
                                    user.findOneAndUpdate({ public_id: publicId }, { status: true ,user_type:details.user_type  }).exec((err, verified) => {
                                        if (err) reject(err);
                                        if (verified) {
                                            authService.getUserDetail(publicId).then(UserDetail => {
                                                authService.generateToken(UserDetail).then(token => {
                                                    resolve({
                                                        success: true, data: { UserDetail, token: token },
                                                        message: 'authentication successfull !!!'
                                                    })
                                                }).catch(err => reject(err))
                                            }).catch(err => reject(err))
                                        } else {
                                            resolve({ success: false, message: 'Error encountered while completing lawyer signup' })
                                        }
                                    })
                                } else {
                                    resolve({ success: true, message: 'Error encountered while adding lawyer details' })
                                }
                            }).catch(err => reject(err))
                    }
                })

            }else{
                resolve({ success: true, message: 'lawyer does not exist' })
            }
        })


    })
}

//get lawyer profile 
exports.getLawyerProfile = (id) => {
    return new Promise((resolve, reject) => {
        model.find({ public_id: id })
            .populate({ path: "practice_area.practice_area_id", model: 'practiceArea', select: { _id: 0, __v: 0 } })
            .populate({ path: "jurisdiction.jurisdiction_id", model: 'jurisdiction', select: { _id: 0, __v: 0 } })
            .exec((err, found) => {
                if (err) reject(err);
                if (found) {
                    resolve({ success: true, message: 'lawyer profile', data: found })
                } else {
                    resolve({ success: false, message: 'could not get lawyer profile !!' })
                }
            })
    })
}

//update lawyer edit profile
exports.editLawyerProfile = (id, data) => {
    return new Promise((resolve, reject) => {
        const details = {
            gender: data.gender,
            country: data.country,
            state_of_origin: data.state_of_origin
        }
        model.findOneAndUpdate({ public_id: id }, details).exec((err, update) => {
            if (err) reject(err);
            if (update) {
                resolve({ success: true, message: 'lawyer Profile updated !!!' })
            } else {
                resolve({ success: false, message: 'error updating lawyer profile!!!' })
            }
        })
    })
}

//delete user account
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

//get list of lawyer 

exports.lawyerList = (pagenumber = 1, pagesize = 20, ) => {
    return new Promise((resolve, reject) => {
        model.find({}).skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
            .populate({ path: "practice_area.practice_area_id", model: 'practiceArea', select: { _id: 0, __v: 0 } })
            .populate({ path: "jurisdiction.jurisdiction_id", model: 'jurisdiction', select: { _id: 0, __v: 0 } })
            .exec((err, found) => {
                if (err) reject(err);
                if (found) {
                    resolve({ success: true, message: 'lawyers found', data: found })
                } else {
                    resolve({ success: false, message: 'could not find list of lawyers' })
                }
            })
    })
}

//sort lawyer by practice area
exports.sortLawerpracticeArea = (id, pagenumber = 1, pagesize = 20) => {
    return new Promise((resolve, reject) => {
        model.find({ 'practice_area.practice_area_id': id })
            .skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
            .populate({ path: "practice_area.practice_area_id", model: 'practiceArea', select: { _id: 0, __v: 0 } })
            .populate({ path: "jurisdiction.jurisdiction_id", model: 'jurisdiction', select: { _id: 0, __v: 0 } })
            .exec((err, found) => {
                if (err) reject(err);
                if (found) {
                    var maps = found.sort(function (a, b) {
                        return b.first_name.length - a.first_name.length;

                    })
                    resolve({ success: true, message: 'lawyers found', data: maps })
                } else {
                    resolve({ success: false, message: 'Could  not find data' })
                }
            })
    })
}

//sort lawyer by location
exports.sortLawyeryLocation = (data, pagenumber = 1, pagesize = 20) => {
    return new Promise((resolve, reject) => {
        model.find({ 'country': data.country, 'state_of_origin': data.state })
            .skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
            .populate({ path: "practice_area.practice_area_id", model: 'practiceArea', select: { _id: 0, __v: 0 } })
            .populate({ path: "jurisdiction.jurisdiction_id", model: 'jurisdiction', select: { _id: 0, __v: 0 } })
            .exec((err, found) => {
                if (err) reject(err);
                if (found) {
                    var maps = found.sort(function (a, b) {
                        return b.first_name.length - a.first_name.length;

                    })
                    resolve({ success: true, message: 'lawyers found', data: maps })
                } else {
                    resolve({ success: false, message: 'Could  not find data' })
                }
            })
    })
}

//search for lawyer
exports.searchLawyer = function (option) {
    return new Promise((resolve, reject) => {
        model.find({ $or: [{ first_name: { $regex: option.search, $options: 'i' } }, { last_name: { $regex: option.search, $options: 'i' } }, 
        { email_address: { $regex: option.search, $options: 'i' } }] }, { _id: 0, __v: 0  , password:0 , status_code:0})
        .populate({ path: "practice_area.practice_area_id", model: 'practiceArea', select: { _id: 0, __v: 0 } })
        .populate({ path: "jurisdiction.jurisdiction_id", model: 'jurisdiction', select: { _id: 0, __v: 0 } })
        .exec((err, found) => {

                if (err) { reject(err); }
                if (found == null || Object.keys(found).length === 0) {
                    resolve({ success: false, data: {}, message: "We could not find what you are looking for." })
                } else {
                    var maps = found.sort(function (a, b) {
                        return b.first_name.length - a.first_name.length;

                    })
                    resolve({ success: true, data: maps, message: "" });
                }
            })
    })
}

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
