const router = require('express').Router()
const passport = require('passport');
const authService = require('../services/authService');
const { generateToken } = require('../utils/jwtUtils');

module.exports = function () {
    // Google sign-up
    router.get('/auth/google', passport.authenticate('google-signup', { scope: ['profile', 'email'] }));
    router.get('/auth/google/callback',
        passport.authenticate('google-signup', { failureRedirect: '/error' }),
        (req, res) => {
            authService.getUserDetail(req.user.public_id).then(activeUser => {
                const response = {
                    public_id: req.user.public_id,
                    first_name: activeUser.first_name,
                    last_name: activeUser.last_name,
                    email_address: activeUser.email_address
                }
                console.log('response sent to client: ', response)
                res.redirect('lawyerpp://signup?user=' + JSON.stringify(response))
            })
        }
    );

    // Google sign-in
    router.get('/auth/google/login', passport.authenticate('google-signin', { scope: ['profile', 'email'] }));
    router.get('/auth/google/callback/login',
        passport.authenticate('google-signin', { failureRedirect: '/error' }),
        (req, res) => {
            console.log('checking google-sign-in: ', req.user)
            res.redirect('lawyerpp://login?user=' + JSON.stringify(req.user))
        })

    // Linkedin sign-up
    router.get('/auth/linkedin', passport.authenticate('signup'))
    router.get('/auth/linkedin/callback',
        passport.authenticate('signup', { failureRedirect: '/error' }),
        (req, res) => {
            authService.getUserDetail(req.user.public_id).then(activeUser => {
                const response = {
                    public_id: req.user.public_id,
                    first_name: activeUser.first_name,
                    last_name: activeUser.last_name,
                    email_address: activeUser.email_address
                }
                console.log('response sent to client: ', response)
                res.redirect('lawyerpp://signup?user=' + JSON.stringify(response))
            })
        })


    // LinkedIn sign-in
    router.get('/auth/linkedin/login', passport.authenticate('signin'));
    router.get('/auth/linkedin/callback/login',
        passport.authenticate('signin', { failureRedirect: '/error' }),
        (req, res) => {
            const response = req.user;
            console.log('Response on Linkedin Login: ',req.user)
            res.redirect('lawyerpp://login?user=' + JSON.stringify(response))
        })

    return router;
}