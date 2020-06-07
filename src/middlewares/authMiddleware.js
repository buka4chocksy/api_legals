const authVerify = require('../services/authService')
const model = require('../models/auth/users')
    //Logic fot authentication goes in here    

exports.authenticate1 = function(req,res,next){
    const token = req.body.token || req.query.token || req.headers['x-access-token']
    if(token){
        authVerify.verifyToken(token).then(decode =>{
            model.findOne({public_id:decode.publicId}).then(data =>{
                if(data == null){
                    res.status(401).send({ success: false, message: "User does not exist" });
                }else{
                    req.auth ={
                        publicId: data.public_id,
                        userType:data.user_type,
                        status:data.status,
                        email: data.email_address,
                        firstName: data.first_name,
                        Id: data._id,
                    }
                    res.locals.response = { data: decode, message: "", success: true };
                    next();
                }
            })
        }).catch(err => {res.status(401).send({success: false, message: "Invalid token", data: err})})
    }else{
        res.status(401).send({success:false , message:'No token Provided !!!'})
    }
}

exports.authenticate = function(req,res , next){
    const token = req.body.token || req.query.token || req.headers['x-access-token']
    const device = req.body.deviceID || req.query.deviceID || req.headers['device-id']
    if(token ){
        authVerify.verifyToken(token).then(decode =>{
            model.findOne({$and:[{public_id:decode.publicId },{ "token.tokenID":token },{ "token.deviceID":device}]} ).then(exist =>{
                if(exist){
                    model.findOne({public_id:decode.publicId}).then(data =>{
                        if(data == null){
                            res.status(401).send({ success: false, message: "User does not exist" });
                        }else{
                            req.auth ={
                                publicId: data.public_id,
                                userType:data.user_type,
                                status:data.status,
                                email: data.email_address,
                                firstName: data.first_name,
                                Id: data._id,
                            }
                            res.locals.response = { data: decode, message: "", success: true };
                            next();
                        }
                    })
                }else{
                    res.status(401).send({success:false , message:'un-authorized access !!!'})  
                }
            })
        }).catch(err => {res.status(401).send({success: false, message: "Invalid token", data: err})})
    }
}