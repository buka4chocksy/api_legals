const service = require('../services/authService')
const cloudinary = require('../middlewares/cloudinary');
module.exports = function authController() {

    this.Register = (req, res, next) => {
        service.Register(req.body).then(data => {
            res.status(200).send(data)
        }).catch(err => res.status(500).send(err));
    }

    this.verifyUser = (req, res) => {
    
        service.verifyUser(req.auth.email ,req.body).then(data => {
            res.status(200).send(data)
        }).catch(err => res.status(500).send(err));
    }

    this.loginUser = (req, res) => {
        service.userLogin(req.body.email_address, req.body.password).then(data => {
            res.status(200).send(data)
        }).catch(err => res.status(500).send(err));
    }

    this.changePassword = (req, res) => {
        const data = {
            password: req.body.password,
            comfirm_password: req.body.new_password
        }
        service.changePassword(req.auth.publicId, data).then(data => {
            res.status(200).send(data)
        }).catch(err => res.status(500).send(err));
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
            .profilePicture(req.auth.publicId, requestDetails)
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    };

}