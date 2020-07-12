const router = require('express').Router()
const {get, create}  = require('../../controllers/common/practiceAreaContoller');

module.exports = () => {
    router.get("/", get);
    router.post("/", create);
    return router;
}
