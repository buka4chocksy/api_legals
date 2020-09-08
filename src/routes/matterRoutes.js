const router = require('express').Router()
const matterController = require('../controllers/matterController')
const middleware = require('../middlewares/authMiddleware');
const multer = require('../middlewares/multer');
module.exports = function () {
    const matterCtrl = new matterController()
    router.put('/create', middleware.authenticate, multer.upload.fields([{ name: 'image', maxCount: 1 }]), matterCtrl.createMatter);
    router.get('/pending_open_matters/:pagesize/:pagenumber', middleware.authenticate, matterCtrl.GetClientPendingOpenMatter);
    router.get('/pending_specified_matters/:pagesize/:pagenumber', middleware.authenticate, matterCtrl.getPendingSpecifiedMatter);
    router.get('/sort_by_practicearea/:pagesize/:pagenumber', middleware.authenticate, matterCtrl.sortClientMatterByPracticeArea)
    router.get('/lawyer_available_matter', middleware.authenticate, matterCtrl.AvailableMattersForBid);
    router.put('/bid_matter', middleware.authenticate, matterCtrl.bidForCase);
    router.get('/specific_matter', middleware.authenticate, matterCtrl.getSpecificMatterDetails);
    router.put('/client_ignore_matter', middleware.authenticate, matterCtrl.ignore_by_client);
    router.put('/lawyer_ignore_matter', middleware.authenticate, matterCtrl.ignore_by_lawyer);
    router.get('/get_matter_interested_lawyers', middleware.authenticate, matterCtrl.get_matter_interested_lawyers);
    return router;
}