const router = require('express').Router()
const nextOfKinController = require('../controllers/nextOfKinController')
const middleware = require('../middlewares/authMiddleware');
const multer = require('../middlewares/multer');
module.exports = function () {
    const nextOfKinCtrl = new nextOfKinController()
    router.post('/:publicid', middleware.authenticate, nextOfKinCtrl.create);
    router.get('/',middleware.authenticate , nextOfKinCtrl.getAllNextofKinDetail  )
    router.patch('/edit', middleware.authenticate , nextOfKinCtrl.update)
    router.get('/single',middleware.authenticate ,nextOfKinCtrl.getSingleNextOfKin )
    router.delete('/delete',middleware.authenticate ,nextOfKinCtrl.deleteNextOfKin )
    return router;
}