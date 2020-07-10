const nextOfKinService = require('../services/common/nextOfKinService');

module.exports = function nextOfKinController() {
    this.create =(req, res, next)=>{
        nextOfKinService.addNextofKinDetails(req.query.publicid,req.body).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => {
            res.status(err.status).send(err)
        });
    }

    this.getAllNextofKinDetail=(req,res , next)=>{
        nextOfKinService.getAllNextofKinDetail(req.auth.publicId).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.update = (req,res,next)=>{
        nextOfKinService.updateNextofKinDetails(req.query.id ,req.auth.publicId , req.body).then(data =>{
            res.status(data.status).send(data);  
        }).catch(err => res.status(err.status).send(err));
    }

    this.getSingleNextOfKin = (req,res , next)=>{
        nextOfKinService.getUserNextOfKinDetail(req.query.id , req.auth.publicId).then(data =>{
            res.status(data.status).send(data);  
        }).catch(err => res.status(err.status).send(err));
    }

    this.deleteNextOfKin = (req,res , next)=>{
        nextOfKinService.deleteNextofKinDetails( req.auth.publicId ,req.query.id ).then(data =>{
            res.status(data.status).send(data);  
        }).catch(err => res.status(err.status).send(err));
    }
}