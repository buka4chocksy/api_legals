var OneSignal = require('onesignal-node');
var App_Id = process.env.appId
var Api_Key = process.env.apiKey
var User_Key = process.env.userKey

var myClient = new OneSignal.Client({
    userAuthKey: User_Key,
    app: { appAuthKey: Api_Key, appId: App_Id }
});

module.exports = {
    sendNotice: (deviceid, msg) => {
        return new Promise((resolve, reject) => {
            var firstNotification = {
                app_id: App_Id,
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