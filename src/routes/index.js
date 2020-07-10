const authRoutes = require('./authRoutes');
const practiceAreaRoutes = require('./practiceAreaRoutes')
const jurisdictionRoutes = require('./jurisdictionRoutes');
const lawyerRoutes = require('./lawyerRoutes');
const lawFirmRoutes = require('./lawFirmRoutes');
const clientRoutes = require('./clientRoutes');
const pannicAlert = require('./panicRoutes');
const bioRoute = require('./bioRoutes')
const recommendationRoutes  = require('./recommendationRoutes');
const nextOfKinRoutes = require('../routes/nextOfKinRoutes');
const matter = require('./matterRoutes');
const experienceRoute = require('./experienceRoutes')
const educationRoute = require('./educationRoutes')
module.exports = (router) => {
    router.use('/auth', authRoutes());
    router.use('/practice_area', practiceAreaRoutes());
    router.use('/jurisdiction', jurisdictionRoutes());
    router.use('/lawyer', lawyerRoutes());
    router.use('/lawfirm', lawFirmRoutes());
    router.use('/client', clientRoutes());
    router.use('/matter', matter());
    router.use('/recommendation',recommendationRoutes());
    router.use('/nextofkin', nextOfKinRoutes());
    router.use('/pannic_alert', pannicAlert())
    router.use('/bio', bioRoute())
    router.use('/experience', experienceRoute())
    router.use('/education', educationRoute())
    return router;
}