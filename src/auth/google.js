const GoogleStrategy = require('passport-google-oauth20');
const { google } = require('../utils/config');
const User = require('../models/users');

module.exports = new GoogleStrategy(google, async (accessToken, refreshToken, profile, done) => {
    User.findOne({ oauthID: profile.id }, (err, user) => {
        if(err) console.log(err);
        if(!err && user !== null) {
            done(null, user);
        } else {
            user = new User({
                oauthID: profile.id,
                name: profile.displayName,
                image_url:profile._json.picture,
                created_at: new Date(),
            })
            user.save(() => {
                if(err) console.log(err);
                else {
                    console.log('saving google user...')
                    done(null, user)
                }
            })
        }
    })
})