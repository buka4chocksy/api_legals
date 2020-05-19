const router = require('express').Router()
const passport = require('passport');
const authService = require('../services/authService');

module.exports = function () {
    // google auth
    router.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));
    router.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/error' }),
        (req, res) => {
            console.log('checking google request: ', req.user)
            res.redirect('lawyerpp://signup?user=' + JSON.stringify(req.user))
        }
    );
    // Linkedin Auth
    router.get('/auth/linkedin', passport.authenticate('linkedin'))
    router.get('/auth/linkedin/callback',
        passport.authenticate('linkedin', { failureRedirect: '/error' }),
        (req, res) => {
            console.log('checking linkedin user: ', req.user)
            const data = {
                oauthID: req.user.oauth.oauthID,
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                email_address: req.user.email_address
            }
            authService.generateToken(data).then(token => {
                const response = {
                    token: token,
                    first_name: req.user.first_name,
                    last_name: req.user.last_name,
                    email_address: req.user.email_address
                }
                res.redirect('lawyerpp://signup?user=' + JSON.stringify(response))
            })
        })
    return router;
}