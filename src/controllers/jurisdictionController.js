const service = require('../services/lawyer/lawyerJurisdictionService');

module.exports = function practiceAreaController() {

    this.addlawyerJurisdiction = (req, res) => {
        service.addlawyerJurisdiction(req.auth.publicId, req.body, req.file).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    };

    this.addJurisdictionFile = (req, res) => {
        if (!req.file) {
            res.status(400).send({message : "no file provided", data : null,status  : 400 })
        } else {
            service.addJurisdictionFile(req.auth.publicId, req.params.id, req.file).then(data => {
                res.status(data.status).send(data);
            }).catch(err => res.status(err.status).send(err));
        }
    };

    this.updateLawyerJurisdiction = (req, res) => {
        service.updateLawyerJurisdiction(req.auth.publicId, req.params.id, req.body).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    };

    this.getlawyerJurisdiction = (req, res) => {
        service.getlawyerJurisdiction(req.auth.publicId).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    };

    this.getSinglelawyerJurisdiction = (req, res) => {
        service.getSinglelawyerJurisdiction(req.auth.publicId, req.params.id).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    };

    this.deleteJurisdictionFile = (req, res) => {
        service.deleteJurisdictionFile(req.auth.publicId, req.params.id, req.params.certid, req.body.certificate_public_id).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    };
};