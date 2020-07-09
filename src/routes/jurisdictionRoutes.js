const router = require('express').Router()
const jurisdictionController = require('../controllers/jurisdictionController')
const multer = require('../../bin/config/multer')

module.exports = function(){
    const jurisCtrl = new jurisdictionController()
    router.post('/jurisdiction_file', multer.upload.single('image'), jurisCtrl.addJurisdictionFile)
    router.post('/add', multer.upload.single('image'), jurisCtrl.addlawyerJurisdiction)
    router.patch('/update', jurisCtrl.updateLawyerJurisdiction)
    router.get('/get', jurisCtrl.getalawyerJurisdiction)
    router.delete('/delete',jurisCtrl.deleteJurisdictionFile);
    return router;
}