const { getAllPracticeArea, createPracticeArea, deletePracticeArea, getPracticeAreaById } = require('../../services/practiceAreaService');


const get = async (req, res, next) => {
    await getAllPracticeArea().then(result => res.status(result.status).send(result))
        .catch(error => next(error));
};

const create = async (req, res, next) => {
    await createPracticeArea(req.body).then(result => res.status(result.status).send(result))
        .catch(error => next(error));
}

const getSingle = async (req, res, next) => {
    await getPracticeAreaById(req.query.id).then(result => res.status(result.status).send(result))
        .catch(error => next(error));
}

const deleteSingle = async (req, res, next) => {
    await deletePracticeArea(req.query.id).then(result => res.status(result.status).send(result))
        .catch(error => next(error));
}


//complete others later

module.exports = {
    get, create, getSingle, deleteSingle
}

