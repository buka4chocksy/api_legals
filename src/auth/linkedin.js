const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const { linkedin } = require('../utils/config')
const User = require('../models/users');
const mongoose = require('mongoose')

module.exports = new LinkedInStrategy(linkedin, async (accessToken, refreshToken, profile, done) => {
    User.findOne({ 'oauth.oauthID': profile.id }, (err, user) => {
        if (err) console.log(err);
        if (user) {
                done(null, user);
        } else {
            const user = new User;
            user.first_name = profile.displayName.split(" ")[0]
            user.last_name = profile.displayName.split(" ")[1]
            user.email_address = profile.emails[0].value
            user.image_url = profile.photos[0].value;
            user.oauth.oauthID = profile.id;
            user.oauth.provider = profile.provider;
            user.public_id = mongoose.Types.ObjectId();
            user.save().then(created => {
                if (created) {
                    console.log('Linkedin User created successfully!')
                    done(null, created)
                }
            }).catch(err => {
                console.log('Error ocurred while creating this user')
            })
        }
    })
}
)