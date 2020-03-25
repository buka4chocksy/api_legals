const router = require('express').Router()
const jurisdictionController = require('../controllers/jurisdictionController')
module.exports = function(){
    const jurisCtrl = new jurisdictionController()
    router.post('/create', jurisCtrl.create)
    router.put('/update', jurisCtrl.update)
    router.get('/', jurisCtrl.getAll)
    router.get('/single',jurisCtrl.getById);
    router.delete('/delete',jurisCtrl.delete);
    return router;
}