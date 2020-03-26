const authVerify = require('../services/authService')
const model = require('../models/users')
    //Logic fot authentication goes in here    

exports.authenticate = function(req,res,next){
    const token = req.body.token || req.query.token || req.headers['x-access-token']
    if(token){
        authVerify.verifyToken(token).then(decode =>{
            model.findOne({public_id:decode.publicId}).then(data =>{
                console.log(data , 'hmmmmm')

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

exports.authorize = function (req, res, next) {
    //Logic fot authorization goes in here    
}