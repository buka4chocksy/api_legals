const router = require('express').Router()
const authController = require('../controllers/authController')
const middleware = require('../middlewares/authMiddleware');
const multer = require('../middlewares/multer');
const userValidator = require('../validators/userValidator');
const validatorHandler = require('../middlewares/errorHandlerMiddleware');

module.exports = function () {
    const authCtrl = new authController()
    router.post('/register', validatorHandler.schemaValidatorHandler(userValidator.schema), authCtrl.Register)
    router.put('/oauth/addphonenumber/:publicid',validatorHandler.schemaValidatorHandler(userValidator.PhoneNumberSchema), authCtrl.UpdatePhonenumberForOAuthRegistration)
    router.put('/verify',middleware.authenticate, authCtrl.verifyUser)
    router.post('/terms/:publicid', authCtrl.terms )
    router.post('/authenticate', authCtrl.loginUser)
    router.post('/password_change_token', authCtrl.passwordToken)
    router.put('/forgot_password_change', authCtrl.ChangeforgotPassword)
    router.put('/change_password', middleware.authenticate, authCtrl.changePassword)
    router.put('/update_token', middleware.authenticate1 , authCtrl.DBupdateToken)
    router.put('/refresh_token' , authCtrl.refreshToken)
    return router;
}