const router = require('express').Router()
const educationController = require('../../controllers/educationController')
const middleware = require('../../middlewares/authMiddleware')
const multer = require('../../middlewares/multer');
module.exports = function(){
    const educationCtrl = new educationController()
    
    router.get('/',  middleware.authenticate, educationCtrl.retrieveEducation)
    router.get('/:id',  middleware.authenticate, educationCtrl.retrieveSingleEducation)
    router.post('/',  middleware.authenticate, educationCtrl.createEducation)
    router.put('/:id',  middleware.authenticate, educationCtrl.updateEducation)
    router.delete('/:id',  middleware.authenticate, educationCtrl.deleteEducation)

    return router;
}