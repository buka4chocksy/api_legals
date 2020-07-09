const service = require('../services/panicService');

module.exports = function panicController(){
    this.createPanicAlert = (req,res)=>{
        service.createPanic(req.body , req.auth.publicId , req.auth.userType).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.getPanicAlerts = (req,res)=>{
        service.getAllPanicAlerts({}).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.getUserPanicAlertDetail = (req,res)=>{
        service.getPanicAlertById(req.auth.publicId).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.deactivatePanic = (req, res)=>{
        var deactivationDetails = {
            client_id: req.body.public_id,
            alert_id: req.body.alert_id,
            reason: req.body.reason,
            alert_type: req.body.alert_type
        }

        service.deactivateAlert(deactivationDetails).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }
}