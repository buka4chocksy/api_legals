const router = require('express').Router()
const lawyerController = require('../controllers/lawyerController')
const middleware = require('../middlewares/authMiddleware')
const multer = require('../middlewares/multer');
module.exports = function(){
    const lawCtrl = new lawyerController()
    router.put('/reg', middleware.authenticate, lawCtrl.completeLawyerRegistration)
    router.put('/update', middleware.authenticate, multer.upload.single('certificate'), lawCtrl.uploadCertificate)
    return router;
}