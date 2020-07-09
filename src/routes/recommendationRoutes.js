const router = require('express').Router()
const RecommendationController = require('../controllers/recommendationController')
const middleware = require('../middlewares/authMiddleware');
module.exports = function () {
    const recommendationCtrl = new RecommendationController()
    router.post('/create', middleware.authenticate, recommendationCtrl.create)
    router.get('/lawyer_recommend', middleware.authenticate, recommendationCtrl.getLawyerRecommendations)
    return router;
}