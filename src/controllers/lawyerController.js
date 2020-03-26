const service = require('../services/lawyerService')
const cloudinary = require('../middlewares/cloudinary');
module.exports = function lawyerController() {
    this.completeLawyerRegistration = (req, res) => {
        service.completelawyerRegisteration(req.auth.Id, req.auth.publicId, req.body).then(data => {
            res.status(200).send(data)
        }).catch(err => res.status(500).send(err));
    }

    this.uploadCertificate = async (req, res) => {
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
            .uploadCertificate(req.auth.Id, req.auth.publicId, requestDetails)
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    };

    this.getLawyerProile = (req, res) => {
        service.getLawyerProfile(req.auth.Id).then(data => {
            res.status(200).send(data);
        }).catch(err => res.status(500).send(err))
    }

    this.updateLawyerProfile = (req, res) => {
        service.editLawyerProfile(req.auth.publicId, req.body).then(data => {
            res.status(200).send(data);
        }).catch(err => res.status(500).send(err))
    }

    this.deleteUserAccount = (req, res) => {
        service.deleteAccount(req.auth.Id).then(data => {
            res.status(200).send(data);
        }).catch(err => res.status(500).send(err))
    }


}