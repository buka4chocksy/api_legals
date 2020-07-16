const {updateUserDetails, updateUserAvatar} = require('../../services/common/userServices');


const UpdateUserDetails = (req, res, next) =>{
    updateUserDetails(req.auth.public_id, req.body).then(result => res.status(result.status).send(result))
    .catch(error => res.status(500).send(error));
}

const UpdateUserAvatar = (req, res, next) => {
    updateUserAvatar(req.auth.public_id, req.file).then(result => res.status(result.status).send(result))
    .catch(error => res.status(500).send(error));
}


module.exports = {
    UpdateUserDetails,UpdateUserAvatar
}