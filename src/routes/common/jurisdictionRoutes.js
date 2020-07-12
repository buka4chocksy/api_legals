const router = require('express').Router()
const {get, create}  = require('../../controllers/common/jurisdictionController');

module.exports = () => {
    router.get("/", get);
    router.post("/", create);
    return router;
}
