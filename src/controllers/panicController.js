const service = require('../services/panicService');

module.exports = function panicController(){
    this.createPanicAlert = async(req,res)=>{
       await service.createPanic(req.body , req.auth.public_id , req.auth.user_type).then(data =>{
            res.status(200).send(data)
        }).catch(err => res.status(500).send(err));
    }

    this.getPanicAlerts = async(req,res)=>{
      await  service.getAllPanicAlerts({}).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.getUserPanicAlertDetail = async(req,res)=>{
       await service.getPanicAlertById(req.auth.public_id).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.deactivatePanic = (req, res)=>{
        var deactivationDetails = {
            client_id: req.auth.public_id,
            alert_id: req.body.alert_id,
        }
        
        if(req.body.reason) deactivationDetails.password = req.body.reason
        if(req.body.alert_type) deactivationDetails.password = req.body.alert_type

        service.deactivateAlert(deactivationDetails).then(data =>{
            res.status(data.status).send(data)
        }).catch(err =>{
            res.status(err.status).send(err)});
    }

    this.getUnresolvedHistory = (req,res)=>{
        service.getUnresolvedHistory(req.auth.public_id).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.getResolvedHistory = async(req,res)=>{
      await  service.getResolvedHistory(req.auth.public_id).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.getHistory = async(req,res)=>{
  await service.getHistory(req.auth.public_id).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.getReceivedHistory = async(req,res)=>{
      await  service.getReceivedHistory(req.auth.public_id).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.getSentHistory = async(req,res)=>{
      await  service.getSentHistory(req.auth.public_id).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }
}