const router = require('express').Router();
const Schema = require('../../validators/PracticeAreaAndJurisdictionSchema');
const { validateJsonPatchOperation } = require('../../validators/updateValidators/index');
const { UpdateUserAvatar, UpdateUserDetails, AddUserDeviceId } = require('../../controllers/common/userSettingController');
const multer = require('../../../bin/config/multer')
const {authenticate} = require('../../middlewares/authMiddleware');

module.exports = () => {
    router.patch("/", [authenticate, validateJsonPatchOperation], UpdateUserDetails);
    router.post("/avatar",[authenticate, multer.upload.single("avatar")],UpdateUserAvatar);
    router.post('/device_id/:id',  authenticate, AddUserDeviceId)
    return router;
};
