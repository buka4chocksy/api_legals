const router = require('express').Router();
const Schema = require('../../validators/PracticeAreaAndJurisdictionSchema');
const { validate } = require('../../validators/lib/index');
const { get, create } = require('../../controllers/common/practiceAreaContoller');

module.exports = () => {
    router.get("/", get);
    router.post("/", validate(Schema), create);
    return router;
};
