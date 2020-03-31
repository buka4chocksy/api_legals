const authRoutes = require('./authRoutes');
const practiceAreaRoutes = require('./practiceAreaRoutes')
const jurisdictionRoutes = require('./jurisdictionRoutes')
const lawyerRoutes = require('./lawyerRoutes')
const lawFirmRoutes = require('./lawFirmRoutes')
const clientRoutes = require('./clientRoutes')
module.exports = (router) => {
    router.use('/auth', authRoutes());
    router.use('/practice_area', practiceAreaRoutes());
    router.use('/jurisdiction', jurisdictionRoutes());
    router.use('/lawyer', lawyerRoutes())
    router.use('/lawfirm', lawFirmRoutes())
    router.use('/client', clientRoutes())
    return router;
}