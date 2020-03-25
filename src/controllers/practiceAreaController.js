const service = require('../services/practiceAreaService');

module.exports = function practiceAreaController(){

    this.create = (req,res)=>{
        service.create(req.body).then(data =>{
            res.status(200).send(data);
        }).catch(err => res.status(500).send(err));
    }

    this.update = (req,res)=>{
        service.update(req.query.id , req.body.new_name).then(data =>{
            res.status(200).send(data);
        }).catch(err => res.status(500).send(err));
    }

    this.getAll = (req, res)=>{
        service.getAll({}).then(data =>{
            res.status(200).send(data); 
        }).catch(err => res.status(500).send(err));
    }

    this.getById = (req, res)=>{
        service.getById(req.query.id).then(data =>{
            res.status(200).send(data); 
        }).catch(err => res.status(500).send(err));
    }

    this.delete = (req, res)=>{
        service.delete(req.query.id).then(data =>{
            res.status(200).send(data); 
        }).catch(err => res.status(500).send(err));
    }
}