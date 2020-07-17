const {getAllJurisdiction, getJurisdictionById, createJurisdiction, updateJurisdiction, deleteJurisdiction}  = require('../../services/jurisdictionService');


const get = (req, res, next) => {
    getAllJurisdiction().then(result => res.status(result.status).send(result))
    .catch(error => next(error));
};

const create = (req, res, next) => {
    createJurisdiction(req.body).then(result => res.status(result.status).send(result))
    .catch(error => next(error));
}

//complete others later

module.exports = {
    get, create
}
