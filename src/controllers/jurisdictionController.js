const service = require('../services/lawyer/jurisdictionService');

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
        console.log(req.query.public_id, req.query.jurisdiction_id, req.body.patch_update_data)
        service.updateLawyerJurisdiction(req.query.public_id, req.query.jurisdiction_id, req.body).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    }

    this.getalawyerJurisdiction = (req, res)=>{
        service.getalawyerJurisdiction(req.body.public_id).then(data =>{
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