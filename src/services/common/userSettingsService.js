const UserSettingsModel = require('../../models/common/userSettings')

const addDeviceId = (public_id, user_id, device_id) => {
    return new Promise((resolve, reject) => {
        UserSettingsModel.findOneAndUpdate({ public_id: public_id }, { $set: { user: user_id, device_id: device_id } }, { new: true, upsert: true }).exec((err, found) => {
            if (err) reject({ success: false, message: err, status: 500 });

            resolve({ success: true, message: 'New device id added', status: 200 })
        })
    })
}

const addOrUpdateUserPanicAlertSetting = (public_id, alert_status) => {
    return new Promise((resolve, reject) => {
        alert_status = Boolean(alert_status);
        UserSettingsModel.findOneAndUpdate({ public_id: public_id }, { "$set": { receive_panic_alert: alert_status } }, { upsert: true }).exec((err, result) => {
            if (err) {
                reject({ status: false, status: 500, message: 'something went wrong', data: null });
            } else {
                resolve({ data: null, message: 'user alert setting updated', status: 200 });
            }
        });
    })
}




module.exports = { addDeviceId, addOrUpdateUserPanicAlertSetting }