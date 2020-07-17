const service = require('../services/panicService');

module.exports = function panicController(){
    this.createPanicAlert = (req,res)=>{
        service.createPanic(req.body , req.auth.public_id , req.auth.userType).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.getPanicAlerts = (req,res)=>{
        service.getAllPanicAlerts({}).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.getUserPanicAlertDetail = (req,res)=>{
        service.getPanicAlertById(req.auth.public_id).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.deactivatePanic = (req, res)=>{
        var deactivationDetails = {
            client_id: req.auth.public_id,
            alert_id: req.body.alert_id,
        }
        
        if(req.body.password) deactivationDetails.password = req.body.password
        if(req.body.reason) deactivationDetails.password = req.body.reason
        if(req.body.alert_type) deactivationDetails.password = req.body.alert_type

        service.deactivateAlert(deactivationDetails).then(data =>{
            res.status(data.status).send(data)
        }).catch(err =>{
            console.log(err)
            res.status(err.status).send(err)});
    }
}