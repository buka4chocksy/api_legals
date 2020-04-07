const router = require('express').Router()
const matterController = require('../controllers/matterController')
const middleware = require('../middlewares/authMiddleware');
const multer = require('../middlewares/multer');
module.exports = function () {
    const matterCtrl = new matterController()
    router.put('/create', middleware.authenticate, multer.upload.single('image'), matterCtrl.createMatter);

    return router;
}