const GoogleStrategy = require('passport-google-oauth20');
const { google } = require('../utils/config');
const User = require('../models/users');

module.exports = new GoogleStrategy(google, async (accessToken, refreshToken, profile, done) => {
    User.findOne({ oauthID: profile.id }, (err, user) => {
        console.log('checking PROFILE: ', profile)
        if (err) console.log(err);
        if (!err && user !== null) {
            done(null, user);
        } else {
            const user = new User;
            user.first_name = profile.displayName.split(" ")[0]
            user.last_name = profile.displayName.split(" ")[1]
            user.image_url = profile._json.picture;
            user.oauth.oauthID = profile.id;
            user.oauth.oauthID = profile.provider;
            user.save().then(created => {
                if (created) {
                    console.log('Google User created successfully!')
                    done(null, created)
                }
            }).catch(err => {
                console.log('Error ocurred while creating this user')
            })
            // const userDetails = {
            //     oauth: {
            //         oauthID: profile.id,
            //         provider: profile.provider
            //     },
            //     first_name: profile.displayName.split(" ")[0],
            //     last_name: profile.displayName.split(" ")[1],
            //     // oauthID: profile.id,
            //     // name: profile.displayName,
            //     image_url: profile._json.picture,
            // }
            // User.create(userDetails).then(created => {
            //     if (created) {
            //         console.log('Google User created successfully!')
            //         done(null, created)
            //     }
            // })
            //     .catch(err => {
            //         console.log('Error ocurred while creating this user')
            //     })
        }
    })
})