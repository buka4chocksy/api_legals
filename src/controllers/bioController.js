const service = require('../services/lawyer/bioService');

module.exports =  function bioController(){
    this.createBio = (req , res)=>{
        console.log(req.body)
        service.createBio(req.body).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => {
            console.log("ERRRRRRR",err)
            res.status(err.status).send(err)})
    }

    this.updateBio = (req , res)=>{
        service.updateBio(req.query, req.body).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.retrieveBio = (req , res)=>{
        service.retrieveBio(req.query).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.deleteBio = (req , res)=>{
        service.deleteBio(req.body).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }
}