const service = require('../services/recommendationService');

module.exports = function recommendationController(){

    this.create = (req,res)=>{
        service.createRecommendation(req.auth.public_id,req.body).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.getLawyerRecommendations = (req,res)=>{
        service.getLawyerRecommendations(req.auth.public_id).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));

    }



}