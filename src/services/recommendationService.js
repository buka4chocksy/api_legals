const model = require('../models/lawyer/recommendation');
const utils = require('../utils/userFormatter');
exports.createRecommendation = (id, option) => {
    return new Promise((resolve, reject) => {
        utils.getClientId(id).then(user => {
            if (user) {
                let details = {
                    lawyerId: option.lawyerId,
                    clientId: user,
                    message: option.message

                }
                model.create(details).then(created => {
                    if (created) {
                        resolve({ success: true, message: 'Recommendation created successfully', status: 200 })
                    } else {
                        resolve({ success: false, message: 'could not create recommendation', status: 500 })
                    }
                }).catch(err => {
                    reject({ err: err, status: 500 })
                })
            } else {

            }
        })

    })
}

exports.getLawyerRecommendations = (lawyerId) => {
    return new Promise((resolve, reject) => {
        utils.getLawyerId(lawyerId).then(lawyer => {
            if (lawyer) {
                model.find({ lawyerId: lawyer })
                    .populate({ path: "lawyerId", model: 'lawyer', select: { __v: 0 } })
                    .populate({ path: "clientId", model: 'client', select: { __v: 0 } })
                    .exec((err, result) => {
                        if (err) reject({ err: err, status: 500 });
                        if (result) {
                            resolve({ success: true, message: "Recommendations", data: result, status: 200 })
                        } else {
                            resolve({ success: false, message: "could not find recommendation", status: 404 })
                        }
                    })
            } else {
                resolve({ success: false, message: "lawyer does not exist", status: 404 })
            }
        }).catch(err => {
            reject({ err: err, status: 500 })
        })

    })
}