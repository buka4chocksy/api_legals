const router = require('express').Router()
const clientController = require('../controllers/clientController')
const middleware = require('../middlewares/authMiddleware')
const multer = require('../middlewares/multer');
module.exports = function(){
    const clientCtrl = new clientController()

    router.put('/profile_picture', middleware.authenticate, multer.upload.single('profile'), clientCtrl.uploadProfilePicture)
    router.put('/update_profile', middleware.authenticate, clientCtrl.updateClientProfile)
    router.delete('/delete_account', middleware.authenticate, clientCtrl.deleteUserAccount)
    router.get('/profile', middleware.authenticate , clientCtrl.getClientDetails)


    return router;
}