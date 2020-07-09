const router = require('express').Router()
const practiceAreaController = require('../controllers/practiceAreaController')
module.exports = function(){
    const practiceAreaCtrl = new practiceAreaController()
    router.post('/add', practiceAreaCtrl.addLawyerPracticeArea)
    router.patch('/update', practiceAreaCtrl.updateUserPracticeArea)
    router.get('/get_all', practiceAreaCtrl.getUserPracticeArea)
    router.get('/get_one', practiceAreaCtrl.getSingleUserPracticeArea);
    router.delete('/delete', practiceAreaCtrl.deleteUserPracticeArea);
    return router;
}