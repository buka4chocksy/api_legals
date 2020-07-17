const service = require('../services/lawyerService')
const cloudinary = require('../middlewares/cloudinary');
module.exports = function lawyerController() {
    this.completeLawyerRegistration = async(req, res) => {
        // if (req.image !== null && req.file !== undefined) {
        //     await cloudinary.uploadToCloud(requestDetails.image).then(img => {
        //         requestDetails.imageUrl = img.url;
        //         requestDetails.imageID = img.ID;
        //         return requestDetails;
        //     });
        // }
        service.completelawyerRegisteration(req.params.publicid, req.body ,req.file).then(data => {
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }
    
    this.getLawyerProile = (req, res) => {
        service.getLawyerProfile(req.auth.public_id).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }
    
    this.updateLawyerProfile = (req, res) => {
        service.editLawyerProfile(req.auth.public_id, req.body).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.deleteUserAccount = (req, res) => {
        service.deleteAccount(req.auth.Id , req.auth.public_id).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.getlawyerList = (req, res) => {
        service.lawyerList(req.params.pagenumber, req.params.pagesize).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.sortLawerByPracticeArea = (req, res) => {
        service.sortLawerpracticeArea(req.params.id ,req.params.pagenumber, req.params.pagesize)
            .then(data => {
                res.status(data.status).send(data);
            }).catch(err => res.status(err.status).send(err))
    }

    this.sortLawyerByLocation = (req, res) => {
        service.sortLawyeryLocation(req.body,req.params.pagenumber, req.params.pagesize)
            .then(data => {
                res.status(data.status).send(data);
            }).catch(err => res.status(err.status).send(err))
    }

    this.searchLawyer = (req, res)=>{
        service.searchLawyer(req.body).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }


    this.uploadProfilePicture = async (req, res) => {
        var requestDetails = {
            image: req.file != null && req.file !== undefined ? req.file.path : null
        };

        if (req.image !== null && req.file !== undefined) {
            await cloudinary.uploadToCloud(requestDetails.image).then(img => {
                requestDetails.imageUrl = img.url;
                requestDetails.imageID = img.ID;
                return requestDetails;
            });
        }
        service
            .profilePicture(req.auth.public_id, requestDetails)
            .then(data => {
                res.status(data.status).send(data);
            })
            .catch(err => {
                res.status(err.status).send(err);
            });
    };

}