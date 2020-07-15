const service = require('../services/lawyer/lawyerJurisdictionService');

module.exports = function practiceAreaController() {

    this.addlawyerJurisdiction = (req, res) => {
        console.log("check", req.auth)
        service.addlawyerJurisdiction(req.auth.public_id, req.body, req.file).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    };

    this.addJurisdictionFile = (req, res) => {
        if (!req.file) {
            res.status(400).send({message : "no file provided", data : null,status  : 400 })
        } else {
            service.addJurisdictionFile(req.auth.public_id, req.params.id, req.file).then(data => {
                res.status(data.status).send(data);
            }).catch(err => res.status(err.status).send(err));
        }
    };

    this.updateLawyerJurisdiction = (req, res) => {
        service.updateLawyerJurisdiction(req.auth.public_id, req.params.id, req.body).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    };

    this.getlawyerJurisdiction = (req, res) => {
        service.getlawyerJurisdiction(req.auth.public_id).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    };

    this.getSinglelawyerJurisdiction = (req, res) => {
        service.getSinglelawyerJurisdiction(req.auth.public_id, req.params.id).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(200).send(err));
    };

    this.deleteJurisdictionFile = (req, res) => {
        console.log(">>>>>>>>>>>",req.auth.public_id, req.params.id, req.params.certid, req.body.certificate_public_id)
        service.deleteJurisdictionFile(req.auth.public_id, req.params.id, req.params.certid, req.body.certificate_public_id).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    };

    this.deleteJurisdiction = (req, res) =>{
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", req.auth.public_id, req.params.id)
        service.deleteJurisdiction(req.auth.public_id, req.params.id).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    }
};