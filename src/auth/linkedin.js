const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const { linkedin, linkedinLogin } = require('../utils/config')
const User = require('../models/auth/users');
const mongoose = require('mongoose')

const LinkedinSignup = new LinkedInStrategy(linkedin, async (accessToken, refreshToken, profile, done) => {
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
                    done(null, created)
                }
            }).catch(err => {
                console.log('Error ocurred while creating this user')
            })
        }
    })
}
)

const LinkedinSignin = new LinkedInStrategy(linkedinLogin, async(accessToken, refreshToken, profile, done) => {
    User.findOne({'oauth.oauthID': profile.id}, (err, user) => {
        console.log('reached here...', user)
        if (err) console.log(err);
        if(user) {
            done(null, user)
        } else {
            done(null, user);
        }
    })
})

module.exports = {
    LinkedinSignup,
    LinkedinSignin
}