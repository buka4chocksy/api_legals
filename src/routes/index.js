const authRoutes = require('./authRoutes');
const practiceAreaRoutes = require('./practiceAreaRoutes')
const jurisdictionRoutes = require('./jurisdictionRoutes');
const lawyerRoutes = require('./lawyerRoutes');
const lawFirmRoutes = require('./lawFirmRoutes');
const clientRoutes = require('./clientRoutes');
const pannicAlert = require('./panicRoutes');
const recommendationRoutes  = require('./recommendationRoutes');
const matter = require('./matterRoutes');
module.exports = (router) => {
    router.use('/auth', authRoutes());
    router.use('/practice_area', practiceAreaRoutes());
    router.use('/jurisdiction', jurisdictionRoutes());
    router.use('/lawyer', lawyerRoutes());
    router.use('/lawfirm', lawFirmRoutes());
    router.use('/client', clientRoutes());
    router.use('/matter', matter());
    router.use('/recommendation',recommendationRoutes());
    router.use('/pannic_alert', pannicAlert())
    return router;
}