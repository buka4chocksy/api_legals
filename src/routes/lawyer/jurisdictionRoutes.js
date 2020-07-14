const router = require('express').Router()
const jurisdictionController = require('../../controllers/jurisdictionController')
const {authenticate} = require('../../middlewares/authMiddleware');
const {validateJsonPatchOperation} = require('../../validators/updateValidators/index');
const multer = require('../../../bin/config/multer')

module.exports = function(){
    const jurisCtrl = new jurisdictionController()
    router.get('/',authenticate, jurisCtrl.getlawyerJurisdiction)
    router.get('/:id',authenticate, jurisCtrl.getSinglelawyerJurisdiction)
    router.patch('/:id',[ authenticate, validateJsonPatchOperation], jurisCtrl.updateLawyerJurisdiction)
    router.post('/jurisdiction_file', multer.upload.single('image'), jurisCtrl.addJurisdictionFile)
    router.post('/add', multer.upload.single('image'), jurisCtrl.addlawyerJurisdiction)
    router.delete('/delete',jurisCtrl.deleteJurisdictionFile);
    return router;
}