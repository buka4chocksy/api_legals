const router = require('express').Router()
const authController = require('../controllers/authController')
const middleware = require('../middlewares/authMiddleware');
const multer = require('../middlewares/multer');
const userValidator = require('../validators/userValidator');
const nextOfKinController =require('../controllers/nextOfKinController');
const {validate} = require('../validators/lib/index'); 

module.exports = function () {
    const authCtrl = new authController()
    const nextOfkinCtrl = new nextOfKinController();
    router.post('/register', validate(userValidator.schema), authCtrl.register)
    router.put('/oauth/addphonenumber/:publicid',validate(userValidator.PhoneNumberSchema), authCtrl.updatePhonenumberForOAuthRegistration)
    router.put('/verify',middleware.authenticate, authCtrl.verifyUser)
    router.post('/terms/:publicid', authCtrl.terms )
    router.post('/authenticate', authCtrl.loginUser)
    router.put('/update_token', middleware.authenticate1 , authCtrl.DBupdateToken)
    router.put('/refresh_token', middleware.decodeUser, authCtrl.refreshToken)
    router.post('/register/nextofkin/add/:publicid',[(req, res, next) => {req.auth = {public_id : req.params.publicid}, next()}],authCtrl.AddNextOfKinOnRegistration);
    router.post('/confirm_password', middleware.authenticate, authCtrl.confirmPassword)
    router.put('/change_password', middleware.authenticate, authCtrl.changePassword)
    router.put('/forgot_password_token', authCtrl.passwordToken)
    router.post('/verify_otp', authCtrl.verifyOtp)
    router.put('/change_forgot_password', authCtrl.changeForgotPassword)

    return router;
}