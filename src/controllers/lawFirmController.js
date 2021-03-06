const service = require('../services/lawFirmService');
const cloudinary = require('../middlewares/cloudinary')
module.exports = function lawFirmController() {


    this.createLawFirm = async(req,res)=>{
        await service.createLawFirm(req.auth.public_id , req.body).then(data =>{
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
            .uploadProfilePicture(req.auth.public_id, req.query.firmId, requestDetails)
            .then(data => {
                res.status(data.status).send(data);
            })
            .catch(err => {
                res.status(err.status).send(err);
            });
    };

    this.getlawfirmProfile = (req, res) => {
        service.getLawFirmProfile(req.auth.public_id, req.query.firmId)
            .then(data => {
                res.status(data.status).send(data);
            }).catch(err => res.status(err.status).send(err));
    }


    this.addAdmin = (req, res) => {
        service.addAdmin(req.auth.public_id, req.query.firmId , req.body)
            .then(data => {
                res.status(data.status).send(data);
            }).catch(err =>{
                res.status(err.status).send(err)
            }
            );
    }

    this.addlocation = (req, res) => {
        service.addLocation(req.auth.public_id, req.query.firmId , req.body)
            .then(data => {
                res.status(data.status).send(data);
            }).catch(err =>{
                res.status(err.status).send(err)
            }
            );
    }

    this.addLawyerToLawfirm = (req,res) =>{
        service.addlawFirmLawyer(req.auth.public_id , req.query.firmId ,req.body).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }
    this.addPracticeAreaTolawFirm = (req,res) =>{
        service.addFirmPracticeArea(req.body ,req.query.firmId).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }
    this.getLawfirmLawyers = (req,res) =>{
        service.getFirmLawyers(req.query.firmId ).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.getLawfirmAdmin = (req,res) =>{
        service.getFirmAdmins(req.query.firmId ).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.getSinglelawfirm = (req,res)=>{
        service.getSinglelawfirm(req.query.firmId).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }
    this.getLawfirmList = (req, res) => {
        service.lawFirmList(req.params.pagenumber, req.params.pagesize).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.lawyerLawFirmList = (req, res) => {
        service.lawyerLawFirmList(req.auth.public_id, req.params.pagenumber, req.params.pagesize).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.sortLawFirmByPracticeArea = (req, res) => {
        service.sortLawFirmBypracticeArea(req.params.id ,req.params.pagenumber, req.params.pagesize)
            .then(data => {
                res.status(data.status).send(data);
            }).catch(err => res.status(err.status).send(err))
    }

    this.sortLawFirmByLocation = (req, res) => {
        service.sortLawFirmByLocation(req.body,req.params.pagenumber, req.params.pagesize)
            .then(data => {
                res.status(data.status).send(data);
            }).catch(err => res.status(err.status).send(err))
    }

    this.searchLawFirm = (req, res)=>{
        service.searchLawfirm(req.body).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.deleteLawfirm = (req, res)=>{
        service.deleteLawfirm(req.query.firmId , req.auth.public_id).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

}