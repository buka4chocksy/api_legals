const service = require('../services/panicService');

module.exports = function pannicController(){
    this.createPanicAlert = (req,res)=>{
        service.createPannic(req.body , req.auth.publicId , req.auth.userType).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.getPanicAlerts = (req,res)=>{
        service.getAllPannicAlerts({}).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.getUserPanicAlertDetail = (req,res)=>{
        service.getPannicAlertById(req.auth.publicId).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }
}