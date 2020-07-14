const nextOfKinService = require('../services/common/nextOfKinService');

module.exports = function nextOfKinController() {
    this.create =(req, res, next)=>{
        console.log("WETIN OOCUR",req.auth)
        nextOfKinService.addNextofKinDetails(req.auth.public_id, req.body).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => {
            res.status(err.status).send(err)
        });
    }

    this.getAllNextofKinDetail=(req,res , next)=>{
        nextOfKinService.getAllNextofKinDetail(req.auth.public_id).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.update = (req,res,next)=>{
        nextOfKinService.updateNextofKinDetails(req.params.id ,req.auth.public_id , req.body).then(data =>{
            res.status(data.status).send(data);  
        }).catch(err => res.status(err.status).send(err));
    }

    this.getSingleNextOfKin = (req,res , next)=>{
        console.log(req.params.id , req.auth.public_id)
        nextOfKinService.getUserNextOfKinDetail(req.params.id , req.auth.public_id).then(data =>{
            res.status(data.status).send(data);  
        }).catch(err => res.status(err.status).send(err));
    }

    this.deleteNextOfKin = (req,res , next)=>{
        nextOfKinService.deleteNextofKinDetails(req.auth.public_id ,req.params.id ).then(data =>{
            res.status(data.status).send(data);  
        }).catch(err => res.status(err.status).send(err));
    }
}