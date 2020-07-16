const africasTalkingKey = process.env.africasTalkingKey
const africasTalkingUsername = process.env.africasTalkingUsername
const credentials = {
    apiKey: africasTalkingKey,
    username: africasTalkingUsername
};
const AfricasTalking = require('africastalking')(credentials);

exports.sms = AfricasTalking.SMS