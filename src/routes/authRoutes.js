const router = require('express').Router()
const authController = require('../controllers/authController')
const middleware = require('../middlewares/authMiddleware');
const passport = require('passport');

module.exports = function () {
    const authCtrl = new authController()
    router.post('/register', authCtrl.Register)
    router.put('/verify', authCtrl.verifyUser)
    router.post('/authenticate', authCtrl.loginUser)
    router.put('/change_password', middleware.authenticate, authCtrl.changePassword)

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