const router = require('express').Router()
const panicController = require('../controllers/panicController')
const middleware = require('../middlewares/authMiddleware');
module.exports = function () {
    // console.log(allRiderSockets, allUserSockets)
    const panicCtrl = new panicController()
    router.post('/create', middleware.authenticate, panicCtrl.createPanicAlert)
    router.get('/', panicCtrl.getPanicAlerts)
    router.get('/user',middleware.authenticate, panicCtrl.getUserPanicAlertDetail)
    router.post('/deactivate_panic',middleware.authenticate, panicCtrl.deactivatePanic)
    router.get('/unresolved_history',middleware.authenticate, panicCtrl.getUnresolvedHistory)
    router.get('/resolved_history',middleware.authenticate, panicCtrl.getResolvedHistory)
    router.get('/panic_history',middleware.authenticate, panicCtrl.getHistory)
    router.get('/sent_history',middleware.authenticate, panicCtrl.getSentHistory)
    router.get('/received_history',middleware.authenticate, panicCtrl.getReceivedHistory)

    return router;
}