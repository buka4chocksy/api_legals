const router = require('express').Router()
const lawFirmController = require('../controllers/lawFirmController')
const middleware = require('../middlewares/authMiddleware');
const multer = require('../middlewares/multer');
module.exports = function () {
    const lawFirmCtrl = new lawFirmController()
    router.post('/create', middleware.authenticate, lawFirmCtrl.createLawFirm);
    router.put('/profile_picture', middleware.authenticate, multer.upload.single('profile'), lawFirmCtrl.uploadProfilePicture)
    router.get('/profile', middleware.authenticate , lawFirmCtrl.getlawfirmProfile)
    router.get('/lawfirms/:pagesize/:pagenumber', middleware.authenticate , lawFirmCtrl.getLawfirmList)
    router.get('/sort_practice_area/:id/:pagesize/:pagenumber', middleware.authenticate , lawFirmCtrl.sortLawFirmByPracticeArea)
    router.get('/sort_location/:pagesize/:pagenumber', middleware.authenticate , lawFirmCtrl.sortLawFirmByLocation)
    router.get('/search', middleware.authenticate , lawFirmCtrl.searchLawFirm)

    return router;
}