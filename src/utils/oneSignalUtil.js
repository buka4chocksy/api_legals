var OneSignal = require('onesignal-node');
var appId = process.env.ONESIGNAL_APP_ID
var apiKey = process.env.ONESIGNAL_API_KEY
var userKey = process.env.ONESIGNAL_USER_KEY


var myClient = new OneSignal.Client({
    userAuthKey: userKey,
    app: { appAuthKey: apiKey, appId: appId }
});

module.exports = {
    sendNotice: (deviceid, msg) => {
        return new Promise((resolve, reject) => {
            var firstNotification = {
                app_id: appId,
                contents: {
                    en: msg,
                },
                include_player_ids: [deviceid],
                large_icon: "https://res.cloudinary.com/genesystechhub/image/upload/v1588057656/pace_nukvcy.png"
                    // big_picture: "https://res.cloudinary.com/genesystechhub/image/upload/c_thumb,w_200,g_face/v1586812526/pace_hrqzaq.jpg"
            }

            myClient.createNotification(firstNotification)
                .then(response => {
                    resolve(true)
                })
                .catch(err => {
                    reject(err)
                });
        })
    }
}