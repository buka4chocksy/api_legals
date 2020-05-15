const service = require('../services/practiceAreaService');

module.exports = function practiceAreaController(){

    this.create = (req,res)=>{
        service.create(req.body).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    }

    this.update = (req,res)=>{
        service.update(req.query.id , req.body.new_name).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    }

    this.getAll = (req, res)=>{
        service.getAll({}).then(data =>{
            res.status(data.status).send(data); 
        }).catch(err => res.status(err.status).send(err));
    }

    this.getById = (req, res)=>{
        service.getById(req.query.id).then(data =>{
            res.status(data.status).send(data); 
        }).catch(err => res.status(err.status).send(err));
    }

    this.delete = (req, res)=>{
        service.delete(req.query.id).then(data =>{
            res.status(data.status).send(data); 
        }).catch(err => res.status(err.status).send(err));
    }
}