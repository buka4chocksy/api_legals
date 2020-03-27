const service = require('../services/lawFirmServices');
const cloudinary = require('../middlewares/cloudinary')
module.exports = function lawFirmController() {

    this.createLawFirm = (req, res) => {
        service.createLawFirm(req.auth.Id, req.body).then(data => {
            res.status(200).send(data)
        }).catch(err => res.status(500).send(data))
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
            .uploadProfilePicture(req.auth.Id, req.query.firmId, requestDetails)
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    };

    this.getlawfirmProfile = (req, res) => {
        service.getLawFirmProfile(req.auth.Id, req.query.firmId)
            .then(data => {
                res.status(200).send(data);
            }).catch(err => res.status(500).send(err));
    }

    this.getLawfirmList = (req, res) => {
        service.lawFirmList(req.params.pagenumber, req.params.pagesize).then(data => {
            res.status(200).send(data);
        }).catch(err => res.status(500).send(err))
    }

    this.sortLawFirmByPracticeArea = (req, res) => {
        service.sortLawFirmBypracticeArea(req.params.id ,req.params.pagenumber, req.params.pagesize)
            .then(data => {
                res.status(200).send(data);
            }).catch(err => res.status(500).send(err))
    }

    this.sortLawFirmByLocation = (req, res) => {
        service.sortLawFirmByLocation(req.body,req.params.pagenumber, req.params.pagesize)
            .then(data => {
                res.status(200).send(data);
            }).catch(err => res.status(500).send(err))
    }
}