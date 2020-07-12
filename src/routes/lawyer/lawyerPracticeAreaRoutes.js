const router = require('express').Router()
const practiceAreaController = require('../../controllers/lawyer/lawyerPracticeAreaController')
module.exports = function(){
    const practiceAreaCtrl = new practiceAreaController()
    router.get('/', practiceAreaCtrl.getUserPracticeArea)
    router.post('/add', practiceAreaCtrl.addLawyerPracticeArea)
    router.patch('/update', practiceAreaCtrl.updateUserPracticeArea)
    router.get('/get_one', practiceAreaCtrl.getSingleUserPracticeArea);
    router.delete('/delete', practiceAreaCtrl.deleteUserPracticeArea);
    return router;
}