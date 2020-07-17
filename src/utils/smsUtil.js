const africasTalkingKey = process.env.AFRICASTALKINGKEY
const africasTalkingUsername = process.env.AFRICASTALKINGUSERNAME
const credentials = {
    apiKey: africasTalkingKey,
    username: africasTalkingUsername
};
const AfricasTalking = require('africastalking')(credentials);

exports.sms = AfricasTalking.SMS