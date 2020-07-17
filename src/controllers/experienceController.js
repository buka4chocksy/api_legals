const service = require('../services/lawyer/experienceService');

module.exports =  function bioController(){
    this.createExperience = (req , res)=>{
        console.log(req.body)
        service.createExperience(req.body).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => {
            console.log("ERRRRRRR",err)
            res.status(err.status).send(err)})
    }

    this.updateExperience = (req , res)=>{
        service.updateExperience(req.auth, req.body).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.retrieveExperience = (req , res)=>{
        service.retrieveExperience(req.auth).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.deleteExperience = (req , res)=>{
        service.deleteExperience(req.auth).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }
}