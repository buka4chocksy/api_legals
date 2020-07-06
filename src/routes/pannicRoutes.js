const router = require('express').Router()
const panicController = require('../controllers/pannicController')
const middleware = require('../middlewares/authMiddleware');
module.exports = function () {
    const pannicCtrl = new panicController()
    router.post('/create', middleware.authenticate, panicCtrl.createPanicAlert)
    router.get('/', pannicCtrl.getPannicAlerts)
    router.get('/user',middleware.authenticate, panicCtrl.getUserPanicAlertDetail)
    return router;
}