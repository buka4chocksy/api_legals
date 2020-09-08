const service = require('../../services/common/bioService');

module.exports =  function bioController(){
    this.createBio = (req , res)=>{
        service.createBio(req.body).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => {
            res.status(err.status).send(err)})
    }

    this.updateBio = (req , res)=>{
        service.updateBio(req.auth, req.body).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.retrieveBio = (req , res)=>{
        service.retrieveBio(req.auth).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.deleteBio = (req , res)=>{
        service.deleteBio(req.auth).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }
}