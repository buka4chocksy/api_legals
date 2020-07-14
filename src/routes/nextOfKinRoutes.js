const router = require('express').Router()
const nextOfKinController = require('../controllers/nextOfKinController')
const middleware = require('../middlewares/authMiddleware');
const multer = require('../middlewares/multer');
module.exports = function () {
    const nextOfKinCtrl = new nextOfKinController()
    router.post('/', middleware.authenticate, nextOfKinCtrl.create);
    router.get('/',middleware.authenticate , nextOfKinCtrl.getAllNextofKinDetail  )
    router.patch('/:id', middleware.authenticate , nextOfKinCtrl.update)
    router.get('/:id',middleware.authenticate ,nextOfKinCtrl.getSingleNextOfKin )
    router.delete('/:id',middleware.authenticate, nextOfKinCtrl.deleteNextOfKin )
    return router;
}