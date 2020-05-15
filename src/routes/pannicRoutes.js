const router = require('express').Router()
const pannicController = require('../controllers/pannicButtonController')
const middleware = require('../middlewares/authMiddleware');
module.exports = function () {
    const pannicCtrl = new pannicController()
    router.post('/create', middleware.authenticate, pannicCtrl.createPannicAlert)
    router.get('/', pannicCtrl.getPannicAlerts)
    router.get('/user',middleware.authenticate, pannicCtrl.getUserPannicAlertDetail)
    return router;
}