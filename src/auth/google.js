const GoogleStrategy = require('passport-google-oauth20');
const { google } = require('../utils/config');
const User = require('../models/users');

module.exports = new GoogleStrategy(google, async (accessToken, refreshToken, profile, done) => {
    User.findOne({ oauthID: profile.id }, (err, user) => {
        if (err) console.log(err);
        if (!err && user !== null) {
            done(null, user);
        } else {
            const userDetails = {
                oauthID: profile.id,
                name: profile.displayName,
                image_url: profile._json.picture
            }
            console.log('checking user to be created: ', userDetails)
            // User.create(userDetails).then(created => {
            //     if (created) {
            //         console.log('Google User created successfully!')
            //         done(null, created)
            //     }
            // })
            //     .catch(err => {
            //         console.log('Error ocurred while creating this user')
            //     })
            user = new User({
                oauthID: profile.id,
                name: profile.displayName,
                image_url:profile._json.picture
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