const router = require('express').Router()
const lawyerController = require('../controllers/lawyerController')
const middleware = require('../middlewares/authMiddleware')
const multer = require('../middlewares/multer');
module.exports = function(){
    const lawCtrl = new lawyerController()
    router.put('/reg', middleware.authenticate, lawCtrl.completeLawyerRegistration)
    router.put('/upload_cert', middleware.authenticate, multer.upload.single('certificate'), lawCtrl.uploadCertificate)
    router.get('/profile', middleware.authenticate, lawCtrl.getLawyerProile)
    router.post('/update_profile', middleware.authenticate, lawCtrl.updateLawyerProfile)
    router.delete('/delete_account', middleware.authenticate, lawCtrl.deleteUserAccount)

    return router;
}