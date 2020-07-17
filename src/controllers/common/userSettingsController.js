const service = require('../../services/common/userSettingsService');

module.exports =  function bioController(){
    this.addDeviceId = (req , res)=>{
        console.log("UPDATE/CREATE DEVICE ID",req.auth, req.params.id)
        service.addDeviceId(req.auth.public_id, req.auth.Id, req.params.id).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => {
            console.log(err)
            res.status(err.status).send(err)
        })
        
    }
}