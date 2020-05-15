const service = require('../services/pannicButtonService');

module.exports = function pannicButtonController(){
    this.createPannicAlert = (req,res)=>{
        service.createPannic(req.body , req.auth.publicId , req.auth.userType).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.getPannicAlerts = (req,res)=>{
        service.getAllPannicAlerts({}).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.getUserPannicAlertDetail = (req,res)=>{
        service.getPannicAlertById(req.auth.publicId).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }
}