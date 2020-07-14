const router = require('express').Router()
const practiceAreaController = require('../../controllers/lawyer/lawyerPracticeAreaController')
const middleware = require('../../middlewares/authMiddleware')

module.exports = function(){
    const practiceAreaCtrl = new practiceAreaController()
    router.post('/', middleware.authenticate, practiceAreaCtrl.addLawyerPracticeArea)
    router.get('/', middleware.authenticate, practiceAreaCtrl.getUserPracticeArea)
    router.patch('/:id', middleware.authenticate, practiceAreaCtrl.updateUserPracticeArea)
    router.get('/:id', middleware.authenticate, practiceAreaCtrl.getSingleUserPracticeArea);
    router.delete('/:id', middleware.authenticate, practiceAreaCtrl.deleteUserPracticeArea);
    return router;
}