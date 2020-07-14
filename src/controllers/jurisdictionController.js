const service = require('../services/lawyer/lawyerJurisdictionService');

module.exports = function practiceAreaController(){

    this.addlawyerJurisdiction = (req,res)=>{
        service.addlawyerJurisdiction(req.body, req.file).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    }

    this.addJurisdictionFile = (req,res)=>{
        service.addJurisdictionFile(req.body, req.file).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    }

    this.updateLawyerJurisdiction = (req,res)=>{
        service.updateLawyerJurisdiction(req.auth.publicId, req.params.id, req.body).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    }

    this.getlawyerJurisdiction = (req, res)=>{
        service.getlawyerJurisdiction(req.auth.publicId).then(data =>{
            res.status(data.status).send(data); 
        }).catch(err => res.status(err.status).send(err));
    }

    this.getSinglelawyerJurisdiction = (req, res)=>{
        service.getSinglelawyerJurisdiction(req.auth.publicId, req.params.id).then(data =>{
            res.status(data.status).send(data); 
        }).catch(err => res.status(err.status).send(err));
    }

    this.deleteJurisdictionFile = (req, res)=>{
        console.log("MY BODY",req.body)
        service.deleteJurisdictionFile(req.body.public_id, req.body.jurisdiction_id, req.body.certificate_id).then(data =>{
            res.status(data.status).send(data); 
        }).catch(err => res.status(err.status).send(err));
    }
}