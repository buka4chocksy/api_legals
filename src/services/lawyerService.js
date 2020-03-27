const model = require('../models/lawyer');
const user = require('../models/users')
const authService = require('../services/authService')

exports.completelawyerRegisteration = (id, publicId, data) => {
    return new Promise((resolve, reject) => {
        const details = {
            user_id: id,
            public_id: publicId,
            enrollment_number: data.enrollment_number,
            practice_area: [{
                practice_area_id: data.practice_area
            }],
            jurisdiction: [{
                jurisdiction_id: data.jurisdiction
            }]
        }
        model.findOne({ user_id: id }).exec((err, exists) => {
            if (err) reject(err)
            if (exists) {
                resolve({ success: true, message: 'lawyer details already exists , please proceed to upload certificate' })
            } else {
                model.create(details).then(created => {
                    if (created) {
                        resolve({ success: true, message: 'complete your registration by uploading your certificate' })
                    } else {
                        resolve({ success: true, message: 'Error encountered while adding lawyer details' })
                    }
                }).catch(err => reject(err))
            }
        })

    })
}

exports.uploadCertificate = (id, publicId, data) => {
    return new Promise((resolve, reject) => {
        const detail = {
            image_url: data.imageUrl
        }
        model.findOneAndUpdate({ user_id: id }, { $push: { law_certificates: detail } })
            .exec((err, updated) => {
                if (err) reject(err);
                if (updated) {
                    user.findOneAndUpdate({ public_id: publicId }, { status: true }).exec((err, verified) => {
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
                    resolve({ success: false, message: 'Error encountered while completing lawyer signup' })
                }
            })
    })
}

//get lawyer profile 
exports.getLawyerProfile = (id) => {
    return new Promise((resolve, reject) => {
        model.find({ user_id: id }).populate({ path: 'user_id', model: 'users' })
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
exports.deleteAccount = (id) => {
    return new Promise((resolve, reject) => {
        model.findOneAndRemove({ user_id: id }).exec((err, deleted) => {
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

exports.lawyerList = (pagenumber = 1, pagesize = 20,) => {
    return new Promise((resolve, reject) => {
        model.find({}).skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
        .populate({ path: 'user_id', model: 'users' })
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
            .populate({ path: 'user_id', model: 'users' })
            .populate({ path: "practice_area.practice_area_id", model: 'practiceArea', select: { _id: 0, __v: 0 } })
            .populate({ path: "jurisdiction.jurisdiction_id", model: 'jurisdiction', select: { _id: 0, __v: 0 } })
            .exec((err, found) => {
                if (err) reject(err);
                if (found) {
                    var maps = found.sort(function (a, b) {
                        return b.user_id.first_name.length - a.user_id.first_name.length;

                    })
                    resolve({ success: true, message: 'lawfirms found', data: maps })
                } else {
                    resolve({ success: false, message: 'Could  not find data' })
                }
            })
    })
}

//sort lawyer by location
exports.sortLawyeryLocation = (data, pagenumber = 1, pagesize = 20) => {
    return new Promise((resolve, reject) => {
        model.find({ 'country': data.country , 'state_of_origin':data.state })
            .skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
            .populate({ path: 'user_id', model: 'users' })
            .populate({ path: "practice_area.practice_area_id", model: 'practiceArea', select: { _id: 0, __v: 0 } })
            .populate({ path: "jurisdiction.jurisdiction_id", model: 'jurisdiction', select: { _id: 0, __v: 0 } })
            .exec((err, found) => {
                if (err) reject(err);
                if (found) {
                    var maps = found.sort(function (a, b) {
                        return b.user_id.first_name.length - a.user_id.first_name.length;

                    })
                    resolve({ success: true, message: 'lawfirms found', data: maps })
                } else {
                    resolve({ success: false, message: 'Could  not find data' })
                }
            })
    })
}