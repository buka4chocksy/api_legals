const router = require('express').Router()
const educationController = require('../controllers/educationController')
const middleware = require('../middlewares/authMiddleware')
const multer = require('../middlewares/multer');
module.exports = function(){
    const educationCtrl = new educationController()

    router.post('/create',  middleware.authenticate, educationCtrl.createEducation)
    router.put('/update',  middleware.authenticate, educationCtrl.updateEducation)
    router.delete('/delete',  middleware.authenticate, educationCtrl.deleteEducation)
    router.get('/retrieve',  middleware.authenticate, educationCtrl.retrieveEducation)

    return router;
}