// const service = require('../services/practiceAreaService');
const service = require('../../services/lawyer/lawyerPracticeAreaService');

module.exports = function practiceAreaController(){

    this.addLawyerPracticeArea = (req,res)=>{
        service.addLawyerPracticeArea(req.body.public_id, req.body.practice_area_data).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    }

    this.getUserPracticeArea = (req,res)=>{
        service.getUserPracticeArea(req.query.public_id).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    }

    this.updateUserPracticeArea = (req,res)=>{
        service.updateUserPracticeArea(req.body.public_id, req.body.practice_area, req.body.patch).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    }

    this.getSingleUserPracticeArea = (req,res)=>{
        service.getSingleUserPracticeArea(req.query.public_id, req.query.practice_area).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    }

    this.deleteUserPracticeArea = (req,res)=>{
        service.deleteUserPracticeArea(req.query.public_id, req.query.practice_area).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err));
    }

}