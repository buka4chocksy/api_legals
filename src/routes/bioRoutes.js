const router = require('express').Router()
const bioController = require('../controllers/bioController')
const middleware = require('../middlewares/authMiddleware')
const multer = require('../middlewares/multer');
module.exports = function(){
    const bioCtrl = new bioController()

    router.post('/', middleware.authenticate, bioCtrl.createBio)
    router.patch('/', middleware.authenticate, bioCtrl.updateBio)
    router.delete('/', middleware.authenticate, bioCtrl.deleteBio)
    router.get('/', middleware.authenticate, bioCtrl.retrieveBio)

    return router;
}