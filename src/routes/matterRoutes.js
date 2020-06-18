const router = require('express').Router()
const matterController = require('../controllers/matterController')
const middleware = require('../middlewares/authMiddleware');
const multer = require('../middlewares/multer');
module.exports = function () {
    const matterCtrl = new matterController()
    router.put('/create', middleware.authenticate, multer.upload.fields([{ name: 'image', maxCount: 1 },{ name: 'audio', maxCount: 1 }]), matterCtrl.createMatter);
    router.get('/pending_open_matters/:pagesize/:pagenumber' , middleware.authenticate, matterCtrl.GetClientPendingOpenMatter);
    router.get('/pending_specified_matters/:pagesize/:pagenumber' , middleware.authenticate, matterCtrl.getPendingSpecifiedMatter);
    router.get('/sort_by_practicearea/:pagesize/:pagenumber', middleware.authenticate, matterCtrl.sortClientMatterByPracticeArea)
    return router;
}