const router = require('express').Router()
const Schema = require('../../validators/PracticeAreaAndJurisdictionSchema');
const { validate } = require('../../validators/lib/index');
const { get, create, getSingle, delete_jurisdiction, updateSingle } = require('../../controllers/common/jurisdictionController');

module.exports = () => {
    router.get("/", get);
    router.post("/", validate(Schema), create);
    router.get("/single", getSingle);
    router.delete("/", delete_jurisdiction);
    router.put("/", updateSingle);
    return router;
}
