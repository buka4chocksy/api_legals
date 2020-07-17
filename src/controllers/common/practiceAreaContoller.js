const { getAllPracticeArea,createPracticeArea , deletePracticeArea, getPracticeAreaById } = require('../../services/practiceAreaService');


const get = (req, res, next) => {
    getAllPracticeArea().then(result => res.status(result.status).send(result))
    .catch(error => next(error));
};

const create = (req, res, next) => {
    createPracticeArea(req.body).then(result => res.status(result.status).send(result))
    .catch(error => next(error));
}

//complete others later

module.exports = {
    get, create
}

