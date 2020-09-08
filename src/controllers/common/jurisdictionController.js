const { getAllJurisdiction, getJurisdictionById, createJurisdiction, updateJurisdiction, deleteJurisdiction } = require('../../services/jurisdictionService');


const get = async (req, res, next) => {
    await getAllJurisdiction().then(result => res.status(result.status).send(result))
        .catch(error => next(error));
};

const create = async (req, res, next) => {
    await createJurisdiction(req.body).then(result => res.status(result.status).send(result))
        .catch(error => next(error));
}

const getSingle = async (req, res, next) => {
    await getJurisdictionById(req.query.id).then(result => res.status(result.status).send(result))
        .catch(error => next(error));
}

const updateSingle = async (req, res, next) => {
    await updateJurisdiction(req.query.id, req.body.name).then(result => res.status(result.status).send(result))
        .catch(error => next(error));
}


const delete_jurisdiction = async (req, res, next) => {
    await deleteJurisdiction(req.query.id).then(result => res.status(result.status).send(result))
        .catch(error => next(error));
}
//complete others later

module.exports = {
    get, create, getSingle, delete_jurisdiction, updateSingle
}
