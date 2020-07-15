const authVerify = require('../services/authService');
const model = require('../models/auth/users');
const TokenModel = require('../models/auth/userToken');
const { verifyTokenSync } = require('../utils/jwtUtils');
//Logic fot authentication goes in here    

exports.authenticate1 = function (req, res, next) {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        authVerify.verifyToken(token).then(decode => {
            model.findOne({ public_id: decode.publicId }).then(data => {
                if (data == null) {
                    res.status(401).send({ success: false, message: "User does not exist" });
                } else {
                    req.auth = {
                        publicId: data.public_id,
                        userType: data.user_type,
                        status: data.status,
                        email: data.email_address,
                        firstName: data.first_name,
                        Id: data._id,
                    };
                    res.locals.response = { data: decode, message: "", success: true };
                    next();
                }
            });
        }).catch(err => { res.status(401).send({ success: false, message: "Invalid token", data: err }); });
    } else {
        res.status(401).send({ success: false, message: 'No token Provided !!!' });
    }
};

exports.authenticate = async (req, res, next) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token'];
    const device = req.body.deviceID || req.query.deviceID || req.headers['device-id'];
    if (token) {
        token = token.replace("Bearer", "").trim();
        let decode = verifyTokenSync(token);
        if (decode instanceof Error) {
            res.setHeader("x-lawyerpp-error", "invalid token");
            res.status(401).send({ success: false, message: "invalid authentication, try logging in" });
        } else if (!decode.hasOwnProperty('public_id')) {
            res.setHeader("x-lawyerpp-error", "expired token");
            res.status(401).send({ success: false, message: 'un-authorized access' });
        } else {
            TokenModel.findOne({ public_id: decode.public_id , "access_token": token  }).then(exist => {
                if (exist) {
                    model.findOne({ public_id: decode.public_id }).then(data => {
                        if (data == null) {
                            res.setHeader("x-lawyerpp-error", "invalid token");
                            res.status(401).send({ success: false, message: "invalid token" });
                        } else {
                            req.auth = {
                                public_id: data.public_id,
                                user_type: data.user_type,
                                status: data.status,
                                email: data.email_address,
                                first_name: data.first_name,
                                Id: data._id,
                            };

                            // console.log(req.auth, "IIN AUTH MIDDLEWARE")
                            res.locals.response = { data: decode, message: "", success: true };
                            next();
                        }
                    });
                } else {
                    res.setHeader("x-lawyerpp-error", "invalid token");
                    res.status(401).send({ success: false, message: 'un-authorized access' });
                }
            });
        }
    }else{
        res.status(401).send({ success: false, message: 'authentication required' });
    }
};