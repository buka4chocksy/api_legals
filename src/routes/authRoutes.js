const router = require('express').Router()
const authController = require('../controllers/authController')
const middleware = require('../middlewares/authMiddleware');
const multer = require('../middlewares/multer');
module.exports = function () {
    const authCtrl = new authController()
    router.post('/register', authCtrl.Register)
    router.put('/verify',middleware.authenticate, authCtrl.verifyUser)
    router.post('/authenticate', authCtrl.loginUser)
    router.put('/change_password', middleware.authenticate, authCtrl.changePassword)
    return router;
}