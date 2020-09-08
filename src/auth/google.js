const GoogleStrategy = require('passport-google-oauth20');
const { google, googleLogin } = require('../utils/config');
const User = require('../models/auth/users');

const GoogleStrategySignup = new GoogleStrategy(google, async (accessToken, refreshToken, profile, done) => {
    User.findOne({"$or" : [{'oauth.oauthID': profile.id}, {email_address : profile._json.email}] }, (err, user) => {
        if (err) console.log(err);
        if (user) {
            user.exist = true;
            done(null, user);
        } else {
            const user = new User;
            user.first_name = profile.displayName.split(" ")[0]
            user.last_name = profile.displayName.split(" ")[1]
            user.email_address = profile._json.email,
            user.image_url = profile._json.picture;
            user.oauth.oauthID = profile.id;
            user.oauth.provider = profile.provider;
            user.save().then(created => {
                if (created) {
                    done(null, created)
                }
            }).catch(err => {
                console.log(err)
            })
        }
    })
})

const GoogleStrategySignin = new GoogleStrategy(googleLogin, async (accessToken, refreshToken, profile, done) => {
    User.findOne({ 'oauth.oauthID': profile.id }, (err, user) => {
        if (err) console.log(err);
        if (user) {
            done(null, user)
        } else {
            done(null, user);
        }
    })
})

module.exports = {
    GoogleStrategySignup, GoogleStrategySignin
}