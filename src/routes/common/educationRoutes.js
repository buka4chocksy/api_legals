const router = require('express').Router()
const educationController = require('../../controllers/common/educationController')
const {authenticate} = require('../../middlewares/authMiddleware')
const multer = require('../../middlewares/multer');
const {validateJsonPatchOperation} = require('../../validators/updateValidators/index');
module.exports = function(){
    const educationCtrl = new educationController()
    router.post('/',  authenticate, educationCtrl.createEducation)
    router.get('/',  authenticate, educationCtrl.retrieveEducation)
    router.get('/:id',  authenticate, educationCtrl.retrieveSingleEducation)
    router.patch('/:id', [authenticate, validateJsonPatchOperation], educationCtrl.updateEducation)
    router.delete('/:id',  authenticate, educationCtrl.deleteEducation)

    return router;
}