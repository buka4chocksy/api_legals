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
    router.get('/lawyers/:pagesize/:pagenumber', middleware.authenticate ,  lawCtrl.getlawyerList)
    router.get('/sort_practice_area/:id/:pagesize/:pagenumber', middleware.authenticate , lawCtrl.sortLawerByPracticeArea)
    router.get('/sort_location/:pagesize/:pagenumber', middleware.authenticate , lawCtrl.sortLawyerByLocation)
    router.get('/search', middleware.authenticate , lawCtrl.searchLawyer)
    router.put('/profile_picture', middleware.authenticate, multer.upload.single('profile'), lawCtrl.uploadProfilePicture)


    return router;
}