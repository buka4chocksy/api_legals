const router = require('express').Router()
const passport = require('passport');

module.exports = function () {
    // google auth
    router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'https://www.googleapis.com/auth/plus.profile.emails.read'] }));
    router.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/auth/google' }),
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
            res.redirect('lawyerpp://signup?user=' + JSON.stringify(req.user))
        })
    return router;
}