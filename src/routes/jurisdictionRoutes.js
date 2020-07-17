const router = require('express').Router()
const jurisdictionController = require('../controllers/jurisdictionController')
const middleware = require('../middlewares/authMiddleware')
const multer = require('../../bin/config/multer')

module.exports = function(){
    const jurisCtrl = new jurisdictionController()
    router.put('/', middleware.authenticate, multer.upload.single('image'), jurisCtrl.addJurisdictionFile)
    router.post('/', multer.upload.single('image'), middleware.authenticate, jurisCtrl.addlawyerJurisdiction)
    router.patch('/', middleware.authenticate, jurisCtrl.updateLawyerJurisdiction)
    router.get('/', middleware.authenticate, jurisCtrl.getalawyerJurisdiction)
    router.delete('/', middleware.authenticate, jurisCtrl.deleteJurisdictionFile);
    return router;
}