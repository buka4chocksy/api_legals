const {updateUserDetails, updateUserAvatar, addDeviceId, updateUserProfile, updateUserProfilePicture} = require('../../services/common/userServices');
const cloudinary = require('../../middlewares/cloudinary')

const UpdateUserDetails = (req, res, next) =>{
    updateUserDetails(req.auth.public_id, req.body).then(result => res.status(result.status).send(result))
    .catch(error => res.status(500).send(error));
}

const UpdateUserAvatar = (req, res, next) => {
    updateUserAvatar(req.auth.public_id, req.file).then(result => res.status(result.status).send(result))
    .catch(error => res.status(500).send(error));
}

const AddUserDeviceId = (req , res)=>{
    console.log("UPDATE/CREATE DEVICE ID",req.auth, req.params.id)
    addDeviceId(req.auth.public_id, req.auth.Id, req.params.id).then(data =>{
        res.status(data.status).send(data);
    }).catch(err => {
        console.log(err)
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


module.exports = {
    UpdateUserDetails,UpdateUserAvatar, AddUserDeviceId, updateProfile, updateProfilePicture
}