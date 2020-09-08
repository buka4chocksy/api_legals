const service = require('../services/clientService');
const cloudinary = require('../middlewares/cloudinary')
module.exports = function clientController() {
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
        await service
            .profilePicture(req.auth.public_id, requestDetails)
            .then(data => {
                res.status(data.status).send(data);
            })
            .catch(err => {
                res.status(err.status).send(err);
            });
    };

    this.updateClientProfile = async (req, res) => {
        await service.editClientProfile(req.auth.public_id, req.body).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.deleteUserAccount = async(req, res) => {
       await service.deleteAccount(req.auth.Id, req.auth.public_id).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.getClientDetails = async(req, res) => {
       await service.getClientProfile(req.auth.public_id).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }
}