const router = require('express').Router()
const passport = require('passport');

module.exports = function () {
    // google auth
    router.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));
    router.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/auth/google' }),
        (req, res) => {
            console.log('checking google request: ', req.user)
            res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user))
        }
    );
    return router;
}