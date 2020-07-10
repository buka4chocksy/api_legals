const router = require('express').Router()
const experienceController = require('../controllers/experienceController')
const middleware = require('../middlewares/authMiddleware')
const multer = require('../middlewares/multer');

module.exports = function(){
    const exprienceCtrl = new experienceController()

    router.post('/create', middleware.authenticate, exprienceCtrl.createExperience)
    router.put('/update', middleware.authenticate, exprienceCtrl.updateExperience)
    router.delete('/delete', middleware.authenticate, exprienceCtrl.deleteExperience)
    router.get('/retrieve', middleware.authenticate, exprienceCtrl.retrieveExperience)

    return router;
}