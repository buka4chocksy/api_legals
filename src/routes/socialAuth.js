const router = require('express').Router()
const passport = require('passport');
const authService = require('../services/authService');

module.exports = function () {
    // google auth
    router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    router.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/error' }),
        (req, res) => {
            console.log('checking google request: ', req.user)
            res.redirect('lawyerpp://signup?user=' + JSON.stringify(req.user))
        }
    );
    // Linkedin Auth
    router.get('/auth/linkedin', passport.authenticate('signup'))
    router.get('/auth/linkedin/callback',
        passport.authenticate('signup', { failureRedirect: '/error' }),
        (req, res) => {
            authService.getUserDetail(req.user.public_id).then(activeUser => {
                console.log({activeUser})
                // authService.generateToken(activeUser).then(token => {
                //     const response = {
                //         token: token,
                //         first_name: activeUser.first_name,
                //         last_name: activeUser.last_name,
                //         email_address: activeUser.email_address,
                //         user_type: activeUser.user_type
                //     }
                //     console.log('response sent to client: ', response)
                //     res.redirect('lawyerpp://signup?user=' + JSON.stringify(response))
                // })
            })
        })


        // LinkedIn Login
        router.get('/auth/linkedin/login', passport.authenticate('signin'));
        router.get('/auth/linkedin/callback/login',
        passport.authenticate('signin', { failureRedirect: '/error' }),
        (req, res) => {
            const response = req.user;
            console.log('Response on Login: '. response)
            res.redirect('lawyerpp://login?user=' + JSON.stringify(response))
        })

    return router;
}