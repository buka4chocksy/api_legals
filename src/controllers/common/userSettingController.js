const { updateUserDetails, updateUserAvatar, addDeviceId, updateUserProfile, updateUserProfilePicture, getUserProfile } = require('../../services/common/userServices');
const cloudinary = require('../../middlewares/cloudinary')

const UpdateUserDetails = (req, res, next) => {
    updateUserDetails(req.auth.public_id, req.body).then(result => res.status(result.status).send(result))
        .catch(error => res.status(500).send(error));
}

const UpdateUserAvatar = (req, res, next) => {
    if (req.file) {
        updateUserAvatar(req.auth.public_id, req.file).then(result => res.status(result.status).send(result))
            .catch(error => res.status(500).send(error));
    } else {
        res.status(400).send({ data: null, status: 400, message: "no file was sent" })
    }
}

const AddUserDeviceId = (req, res) => {
    addDeviceId(req.auth.public_id, req.auth.Id, req.params.id).then(data => {
        res.status(data.status).send(data);
    }).catch(err => {
        res.status(err.status).send(err)
    })

}

const updateProfile = (req, res, next) => {
    updateUserProfile(req.auth, req.body).then(data => {
        res.status(data.status).send(data);
    }).catch(err => res.status(err.status).send(err))
}

const updateProfilePicture = async (req, res) => {
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
    updateUserProfilePicture(req.auth, requestDetails)
        .then(data => {
            res.status(data.status).send(data);
        })
        .catch(err => {
            res.status(err.status).send(err);
        });
}

const getProfile = (req, res) => {
    getUserProfile(req.auth).then(data => {
        res.status(data.status).send(data);
    }).catch(err => res.status(err.status).send(err))
}


module.exports = {
    UpdateUserDetails, UpdateUserAvatar, AddUserDeviceId, updateProfile, updateProfilePicture, getProfile
}