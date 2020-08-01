const GoogleStrategy = require('passport-google-oauth20');
const { google, googleLogin } = require('../utils/config');
const User = require('../models/auth/users');

const GoogleStrategySignup = new GoogleStrategy(google, async (accessToken, refreshToken, profile, done) => {
    User.findOne({"$or" : [{'oauth.oauthID': profile.id}, {email_address : profile._json.email}] }, (err, user) => {
        console.log("GOOGLE CHECKING USER FOUND", user)
        if (err) console.log(err);
        if (user) {
            done(null, {exist : true, data : user});
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
                    console.log('Google User created successfully!')
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
        console.log(' Google reached here...', user)
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