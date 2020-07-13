const router = require('express').Router()
const practiceAreaController = require('../../controllers/lawyer/lawyerPracticeAreaController')
module.exports = function(){
    const practiceAreaCtrl = new practiceAreaController()
    router.get('/', practiceAreaCtrl.getUserPracticeArea)
    router.post('/', practiceAreaCtrl.addLawyerPracticeArea)
    router.patch('/id', practiceAreaCtrl.updateUserPracticeArea)
    router.get('/:id', practiceAreaCtrl.getSingleUserPracticeArea);
    router.delete('/:id', practiceAreaCtrl.deleteUserPracticeArea);
    return router;
}