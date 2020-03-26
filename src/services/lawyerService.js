const model = require('../models/lawyer');
const user = require('../models/users')
const authService = require('../services/authService')

exports.completelawyerRegisteration = (id, data) => {
    return new Promise((resolve, reject) => {
        const details = {
            user_id: id,
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

exports.uploadCertificate = (id, data) => {
    return new Promise((resolve, reject) => {
        const detail = {
            image_url: data.imageUrl
        }
        model.findOneAndUpdate({ user_id: id }, { $push: { law_certificates: detail } })
            .exec((err, updated) => {
                if (err) reject(err);
                if (updated) {
                    user.findOneAndUpdate({ public_id: id }, { status: true }).exec((err, verified) => {
                        if (err) reject(err);
                        if (verified) {
                            authService.getUserDetail(id).then(UserDetail => {
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
                }
            })
    })
}



