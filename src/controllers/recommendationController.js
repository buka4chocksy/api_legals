const service = require('../services/recommendationService');

module.exports = function recommendationController(){

    this.create = (req,res)=>{
        service.createRecommendation(req.auth.publicId,req.body).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.getLawyerRecommendations = (req,res)=>{
        service.getLawyerRecommendations(req.auth.publicId).then(data =>{
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));

    }



}