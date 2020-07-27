const {updateUserDetails, updateUserAvatar, addDeviceId} = require('../../services/common/userServices');


const UpdateUserDetails = (req, res, next) =>{
    updateUserDetails(req.auth.public_id, req.body).then(result => res.status(result.status).send(result))
    .catch(error => res.status(500).send(error));
}

const UpdateUserAvatar = (req, res, next) => {
    if(req.file){
    updateUserAvatar(req.auth.public_id, req.file).then(result => res.status(result.status).send(result))
    .catch(error => res.status(500).send(error));
    }else{
        res.status(400).send({data : null, status : 400, message : "no file was sent"})
    }
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


module.exports = {
    UpdateUserDetails,UpdateUserAvatar, AddUserDeviceId
}