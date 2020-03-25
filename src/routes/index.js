const authRoutes = require('./authRoutes');
const practiceAreaRoutes = require('./practiceAreaRoutes')
const jurisdictionRoutes = require('./jurisdictionRoutes')
module.exports = (router) => {
    router.use('/auth', authRoutes());
    router.use('/practice_area', practiceAreaRoutes());
    router.use('/jurisdiction',jurisdictionRoutes());
    return router;
}