const router = require('express').Router()
const authController = require('../controllers/authController')
const middleware = require('../middlewares/authMiddleware');
const multer = require('../middlewares/multer');
const userValidator = require('../validators/userValidator');
const validatorHandler = require('../middlewares/errorHandlerMiddleware');

module.exports = function () {
    const authCtrl = new authController()
    router.post('/register', validatorHandler.schemaValidatorHandler(userValidator.schema), authCtrl.Register)
    router.put('/verify',middleware.authenticate, authCtrl.verifyUser)
    router.post('/terms',middleware.authenticate, authCtrl.terms )
    router.post('/authenticate', authCtrl.loginUser)
    router.put('/change_password', middleware.authenticate, authCtrl.changePassword)
    router.put('/update_token', middleware.authenticate1 , authCtrl.DBupdateToken)
    router.put('/refresh_token' , authCtrl.refreshToken)
    return router;
}