const userSettings = require('../../models/common/userSettings')

const addDeviceId = (public_id, user_id, device_id) => {
    return new Promise((resolve, reject) => {
        userSettings.findOneAndUpdate({ public_id: public_id}, {$set: {user: user_id, device_id: device_id}}, {new: true, upsert: true}).exec((err, found) => {
            if (err) reject({ success: false, message: err, status: 500 });

            resolve({ success: true, message: 'New device id added', status: 200 })
        })
    })
}

module.exports = { addDeviceId }