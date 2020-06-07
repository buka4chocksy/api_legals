const service = require('../services/lawFirmServices');
const cloudinary = require('../middlewares/cloudinary')
module.exports = function lawFirmController() {

    this.createLawFirm = (req, res) => {
        service.createLawFirm(req.auth.publicId, req.body).then(data => {
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(data))
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
            .uploadProfilePicture(req.auth.publicId, req.query.firmId, requestDetails)
            .then(data => {
                res.status(data.status).send(data);
            })
            .catch(err => {
                res.status(err.status).send(err);
            });
    };

    this.getlawfirmProfile = (req, res) => {
        service.getLawFirmProfile(req.auth.publicId, req.query.firmId)
            .then(data => {
                res.status(data.status).send(data);
            }).catch(err => res.status(err.status).send(err));
    }


    this.addAdmin = (req, res) => {
        service.addAdmin(req.auth.publicId, req.query.firmId , req.body)
            .then(data => {
                res.status(data.status).send(data);
            }).catch(err =>{
                console.log("eeror fro", err)
                res.status(err.status).send(err)
            }
            );
    }


    this.getLawfirmList = (req, res) => {
        service.lawFirmList(req.params.pagenumber, req.params.pagesize).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.lawyerLawFirmList = (req, res) => {
        service.lawyerLawFirmList(req.auth.publicId, req.params.pagenumber, req.params.pagesize).then(data => {
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

}