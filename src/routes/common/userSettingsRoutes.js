const router = require('express').Router()
const userSettingsController = require('../../controllers/common/userSettingsController')
const {authenticate} = require('../../middlewares/authMiddleware')
const {validateJsonPatchOperation} = require('../../validators/updateValidators/index');

module.exports = function(){
    const userSettingsCtrl = new userSettingsController()
    router.post('/device_id/:id',  authenticate, userSettingsCtrl.addDeviceId)

    return router;
}