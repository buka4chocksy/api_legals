const service = require('../services/lawyer/educationService');

module.exports =  function bioController(){
    this.createEducation = (req , res)=>{
        console.log(req.body)
        service.createEducation(req.body).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => {
            console.log("ERRRRRRR",err)
            res.status(err.status).send(err)})
    }

    this.updateEducation = (req , res)=>{
        service.updateEducation(req.query, req.body).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.retrieveEducation = (req , res)=>{
        service.retrieveEducation(req.query).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.deleteEducation = (req , res)=>{
        service.deleteEducation(req.body).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }
}