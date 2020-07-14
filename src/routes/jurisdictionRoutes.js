const router = require('express').Router()
const jurisdictionController = require('../controllers/jurisdictionController')
const multer = require('../../bin/config/multer')

module.exports = function(){
    const jurisCtrl = new jurisdictionController()
    router.put('/', multer.upload.single('image'), jurisCtrl.addJurisdictionFile)
    router.post('/', multer.upload.single('image'), jurisCtrl.addlawyerJurisdiction)
    router.patch('/', jurisCtrl.updateLawyerJurisdiction)
    router.get('/', jurisCtrl.getalawyerJurisdiction)
    router.delete('/',jurisCtrl.deleteJurisdictionFile);
    return router;
}