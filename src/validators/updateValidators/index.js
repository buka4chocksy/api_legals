const {validate} = require('fast-json-patch');


const validateJsonPatchOperation = (req, res, next) => {
    let validationResult = validate(req.body)
    console.log("in the valid", validationResult)
    if(validationResult){
        res.status(400).send({message : "malformed patch array", data : null, success : false, status : 400});
    }else{
        next(null);
    }
}

const transFormPatchObject = (body) => (req, res, next) => {
    if(!Array.isArray(req.body)){
        res.status(400).send({message : "patch object must be an array", data : null, success : false, status : 400});
    }else{
        // req.body.map(x=>)
    }
}

module.exports = {
    validateJsonPatchOperation, transFormPatchObject
}