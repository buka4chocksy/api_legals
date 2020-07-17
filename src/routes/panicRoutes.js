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

    return router;
}