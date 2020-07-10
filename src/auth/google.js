const GoogleStrategy = require('passport-google-oauth20');
const { google } = require('../utils/config');
const User = require('../models/auth/users');

module.exports = new GoogleStrategy(google, async (accessToken, refreshToken, profile, done) => {
    User.findOne({ 'oauth.oauthID': profile.id }, (err, user) => {
        if (err) console.log(err);
        if (user) {
            done(null, user);
        } else {
            const user = new User;
            user.first_name = profile.displayName.split(" ")[0]
            user.last_name = profile.displayName.split(" ")[1]
            user.email_address = 'google.com'
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