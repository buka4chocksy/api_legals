const router = require('express').Router()
const practiceAreaController = require('../controllers/practiceAreaController')
module.exports = function(){
    const pareaCtrl = new practiceAreaController()
    router.post('/create', pareaCtrl.create)
    router.put('/update', pareaCtrl.update)
    router.get('/', pareaCtrl.getAll)
    router.get('/single',pareaCtrl.getById);
    router.delete('/delete',pareaCtrl.delete);
    return router;
}