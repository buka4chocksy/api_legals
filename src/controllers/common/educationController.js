const service = require('../../services/common/educationService');

module.exports =  function bioController(){
    this.createEducation = (req , res)=>{
        console.log(req.body)
        service.createEducation(req.auth.public_id, req.body).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => {
            console.log("ERRRRRRR",err)
            res.status(err.status).send(err)})
    }

    this.updateEducation = (req , res)=>{
        service.updateEducation(req.auth.public_id,req.params.id, req.body).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.retrieveEducation = (req , res)=>{
        service.retrieveEducation(req.auth.public_id).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.retrieveSingleEducation = (req , res)=>{
        service.retrieveSingleUserEduction(req.auth.public_id, req.params.id).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.deleteEducation = (req , res)=>{
        service.deleteEducation(req.auth.public_id,req.params.id).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }
}