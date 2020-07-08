const service = require('../services/clientService');
const cloudinary = require('../middlewares/cloudinary')
module.exports =  function clientController(){
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
            .profilePicture(req.auth.publicId, requestDetails)
            .then(data => {
                res.status(data.status).send(data);
            })
            .catch(err => {
                res.status(err.status).send(err);
            });
    };

    this.updateClientProfile = (req, res) => {
        service.editClientProfile(req.auth.publicId, req.body).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.deleteUserAccount = (req, res) => {
        service.deleteAccount(req.auth.Id , req.auth.publicId).then(data => {
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }

    this.getClientDetails = (req , res)=>{
        service.getClientProfile(req.auth.publicId).then(data =>{
            res.status(data.status).send(data);
        }).catch(err => res.status(err.status).send(err))
    }
}