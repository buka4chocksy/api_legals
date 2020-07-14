const router = require('express').Router()
const jurisdictionController = require('../../controllers/jurisdictionController')
const {authenticate} = require('../../middlewares/authMiddleware');
const {validateJsonPatchOperation} = require('../../validators/updateValidators/index');
const multer = require('../../../bin/config/multer')

module.exports = function(){
    const jurisCtrl = new jurisdictionController()
    router.post('/',[authenticate, multer.upload.single('cert')], jurisCtrl.addlawyerJurisdiction)
    router.post('/:id/addcert',[authenticate,multer.upload.single('cert')], jurisCtrl.addJurisdictionFile)
    router.get('/',authenticate, jurisCtrl.getlawyerJurisdiction)
    router.get('/:id',authenticate, jurisCtrl.getSinglelawyerJurisdiction)
    router.patch('/:id',[ authenticate, validateJsonPatchOperation], jurisCtrl.updateLawyerJurisdiction)
    router.delete('/:id/cert/:certid',authenticate,jurisCtrl.deleteJurisdictionFile);
    return router;
}