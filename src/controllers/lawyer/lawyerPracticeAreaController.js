// const service = require('../services/practiceAreaService');
const service = require('../../services/lawyer/lawyerPracticeAreaService');

module.exports = function practiceAreaController(){

    this.addLawyerPracticeArea = (req,res)=>{
        service.addLawyerPracticeArea(req.auth.public_id, req.body.practice_area_data).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    }

    this.getUserPracticeArea = (req,res)=>{
        service.getUserPracticeArea(req.auth.public_id).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    }

    this.updateUserPracticeArea = (req,res)=>{
        service.updateUserPracticeArea(req.auth.public_id, req.params.id, req.body.patch).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    }

    this.getSingleUserPracticeArea = (req,res)=>{
        service.getSingleUserPracticeArea(req.auth.public_id,  req.params.id).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    }

    this.deleteUserPracticeArea = (req,res)=>{
        service.deleteUserPracticeArea(req.auth.public_id,  req.params.id).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    }

}