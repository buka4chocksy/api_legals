const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const { linkedin } = require('../utils/config')
const User = require('../models/users');

module.exports = new LinkedInStrategy(linkedin, async (accessToken, refreshToken, profile, done) => {
        User.findOne({ oauthID: profile.id }, (err, user) => {
            if(err) console.log(err);
            if(!err && user !== null) {
                done(null, user);
            } else {
                const userDetails = {
                    oauthID: profile.id,
                    name: profile.displayName,
                    image_url: profile.photos[0].value,
                }
                User.create(userDetails).then(created => {
                    if(created) {
                        console.log('Linkedin User created successfully!')
                        done(null, created)
                    }
                })
                .catch(err => {
                    console.log('Error ocurred while creating this user')
                })
            }
        })
    }
)