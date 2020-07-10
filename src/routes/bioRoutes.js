const router = require('express').Router()
const bioController = require('../controllers/bioController')
const middleware = require('../middlewares/authMiddleware')
const multer = require('../middlewares/multer');
module.exports = function(){
    const bioCtrl = new bioController()

    router.post('/create', middleware.authenticate, bioCtrl.createBio)
    router.put('/update', middleware.authenticate, bioCtrl.updateBio)
    router.delete('/delete', middleware.authenticate, bioCtrl.deleteBio)
    router.get('/retrieve', middleware.authenticate, bioCtrl.retrieveBio)

    return router;
}