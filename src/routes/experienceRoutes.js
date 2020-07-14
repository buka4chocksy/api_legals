const router = require('express').Router()
const experienceController = require('../controllers/experienceController')
const middleware = require('../middlewares/authMiddleware')
const multer = require('../middlewares/multer');

module.exports = function(){
    const exprienceCtrl = new experienceController()

    router.post('/', middleware.authenticate, exprienceCtrl.createExperience)
    router.patch('/', middleware.authenticate, exprienceCtrl.updateExperience)
    router.delete('/', middleware.authenticate, exprienceCtrl.deleteExperience)
    router.get('/', middleware.authenticate, exprienceCtrl.retrieveExperience)

    return router;
}