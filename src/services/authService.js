const model = require('../models/users');
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose');
// const mailer = require('../middlewares/mailer');
const secret = process.env.Secret
const client = require('../models/client');
const jwt = require('jsonwebtoken');

//user signup
exports.Register = (data) => {
    return new Promise((resolve, reject) => {
        const hash = bcrypt.hashSync(data.password, 10)
        const gen = Math.floor(1000 + Math.random() * 9000);
        const userDetails = {
            first_name: data.first_name,
            last_name: data.last_name,
            email_address: data.email_address,
            phone_number: data.phone_number,
            user_type: data.user_type,
            status_code: gen,
            password: hash,
            public_id: mongoose.Types.ObjectId(),
        }
        model.findOne({ email_address: userDetails.email_address }).then(found => {
            if (found) {
                //when a lawyer has created a user profile but didnt complete his signup
                    if (found.status == false) {
                        getUserDetail(found.public_id).then(user => {
                            generateToken(user).then(token => {
                                resolve({
                                    success: true, data: token,
                                    message: 'please complete your signup process'
                                })
                            }).catch(err => reject(err))
                        }).catch(err => reject(err))
                    } else {
                        if(found.terms == false){
                            getUserDetail(found.public_id).then(user => {
                                generateToken(user).then(token => {
                                    resolve({
                                        success: true, data: token,
                                        message: 'please accept the terms and condition'
                                    })
                                }).catch(err => reject(err))
                            }).catch(err => reject(err))
                        }else{
                            resolve({ success: false, message: 'User already exists please proceed to sign in !!!' })
                        }
                    }

            } else {
                //
                model.create(userDetails).then(created => {
                    if (created) {
                        if (userDetails.user_type == 'lawyer') {
                            const lawyer_id = created.public_id
                            getUserDetail(lawyer_id).then(user => {
                                generateToken(user).then(token => {
                                    resolve({
                                        success: true, data: token,
                                        message: 'proceed to fill your  practicearea , enrollment number and jurisdiction '
                                    })
                                }).catch(err => reject(err))
                            }).catch(err => reject(err))
                        } else {
                            mailer.SignUpMail(userDetails.email_address, userDetails.status_code, userDetails.first_name, userDetails.last_name).then(sent => {
                                if (sent) {
                                    getUserDetail(created.public_id).then(clientDetail => {
                                        generateToken(clientDetail).then(token => {
                                            resolve({
                                                success: true, data: token,
                                                message: 'Registration successfull , proceed to verify ur account '
                                            })
                                        }).catch(err => reject(err))
                                    }).catch(err => reject(err))
                                } else {
                                    resolve({ success: false, message: 'Error encountered while signing up !!' })
                                }
                            }).catch(err => reject(err));
                        }
                    } else {
                        resolve({ success: false, message: 'Error registering user !!' })
                    }
                }).catch(err => reject(err));
            }
        }).catch(err => reject(err));
    })
}

//user verification 
exports.verifyUser = (email ,option) => {
    return new Promise((resolve, reject) => {
        model
            .findOne({ email_address: email })
            .then(found => {
                const clientData = {
                    first_name: found.first_name,
                    last_name: found.last_name,
                    email_address: found.email_address,
                    phone_number: found.phone_number,
                    user_type: found.user_type,
                    public_id:found.public_id
                }
                if(clientData.user_type == 'lawyer'){
                    resolve({success:false , message:'Sorry you cannot verify your account using this process'})
                }else{
                    if (found.status_code == option.status_code) {
                        model
                            .findOneAndUpdate({ email_address: email }, { status: true })
                            .then(updated => {
                                if (updated) {
                                    client.create(clientData).then(created =>{
                                        if(created){
                                            getUserDetail(found.public_id).then(activeUser => {
                                                generateToken(activeUser).then(token => {
                                                    resolve({
                                                        success: true, data: { activeUser, token: token },
                                                        message: 'authentication successfull !!!'
                                                    })
                                                }).catch(err => reject(err))
                                            }).catch(err => reject(err))
                                        }else{
                                            resolve({
                                                success: false,
                                                message: "Error verifying client !!!"
                                            });
                                        }
                                    }).catch(err => reject(err))
                             
                                } else {
                                    resolve({
                                        success: false,
                                        message: "account verification failed !!!"
                                    });
                                }
                            })
                            .catch(err => reject(err));
                    } else {
                        resolve({
                            success: false,
                            message: "invalid email or veririfcation code "
                        });
                    }
                }
            })
            .catch(err => {
                reject(err);
            });
    });
};

exports.acceptTerms =(data , id)=>{
    return new Promise((resolve , reject)=>{
        
        if(data.accept == 'accept'){
            model.findOneAndUpdate({public_id:id},{terms:true}).exec((err , updated)=>{
            if(err)reject(err);
                if(updated){
                    getUserDetail(id).then(activeUser => {
                        generateToken(activeUser).then(token => {
                            resolve({
                                success: true, data: { activeUser, token: token },
                                message: 'authentication successfull !!!'
                            })
                        }).catch(err => reject(err))
                    }).catch(err => reject(err)) 
                }
            })
        }else{
            resolve({success:false , message:'Terms and policy declined !!!'})
        }
    })
}

//user login
exports.userLogin = (email_address, password) => {
    return new Promise((resolve, reject) => {
        model.findOne({ email_address: email_address }, { _id: 0, __v: 0, }).then(user => {
            if (user) {
                if (user.status != true) reject({ success: false, message: 'account not verified !!!' })
            if(user.terms !=true){
                getUserDetail(user.public_id).then(activeUser => {
                    generateToken(activeUser).then(token => {
                        resolve({
                            success: false, token: token ,
                            message: 'Sorry you have not accepted the terms and condition!!!'
                        })
                    }).catch(err => reject(err))
                }).catch(err => reject(err))
            }else{
                const comparePassword = bcrypt.compareSync(password, user.password)
                if (comparePassword) {
                    getUserDetail(user.public_id).then(activeUser => {
                        generateToken(activeUser).then(token => {
                            resolve({
                                success: true, data: { activeUser, token: token },
                                message: 'authentication successfull !!!'
                            })
                        }).catch(err => reject(err))
                    }).catch(err => reject(err))
                } else {
                    resolve({ success: false, message: 'incorrect email or password ' })
                }
            }

            } else {
                resolve({ success: false, message: 'user does not exist !!!' })
            }
        }).catch(err => {
            reject(err)
        })
    })
}



//user password change
exports.changePassword = (id, data) => {
    return new Promise((resolve, reject) => {
        model.findOne({ public_id: id }).then(exists => {
            if (exists) {
                const db_password = exists.password
                const old_password = data.password
                const new_password = bcrypt.hashSync(data.comfirm_password, 10)
                const compare_password = bcrypt.compareSync(old_password, db_password)
                if (compare_password == true) {
                    model.findOneAndUpdate({ public_id: id }, { password: new_password })
                        .then(updated => {
                            if (updated) {
                                resolve({ success: true, message: 'Password updated successfully !!' })
                            } else {
                                resolve({ success: false, message: 'Password was not updated successfully !!' })
                            }
                        }).catch(err => reject(err))
                } else {
                    resolve({ success: false, message: 'Invalid password inserted !!!' })
                }
            } else {
                resolve({ success: false, message: 'user does not exists !!!' })
            }
        }).catch(err => reject(err));
    })
}




//get user details
function getUserDetail(Id) {
    return new Promise((resolve, reject) => {

        model.findOne({ public_id: Id }, { _id: 0, __v: 0 })
            .then(data => {
                var specificUserDetail = {
                    email_address: data.email_address,
                    fullname: data.first_name + ' ' + data.last_name,
                    phone: data.phone_number,
                    publicId: data.public_id,
                    userType: data.user_type,
                    status: data.status,
                    image_url: data.image_url
                };
                resolve(specificUserDetail);
            })
            .catch(error => reject(error));
    });
}
exports.getUserDetail = getUserDetail

//generate token
function generateToken(data = {}) {
    return new Promise((resolve, reject) => {
        jwt.sign({ ...data }, secret, { expiresIn: "24hrs" }, function (err, token) {
            if (err) {
                reject(err);
            } else {
                resolve(token);
            }
        });
    });
}

exports.generateToken = generateToken;

//verify user token
function verifyToken(token = "") {
    return new Promise((resolve, reject) => {
        jwt.verify(token.replace("Bearer", ""), secret, function (
            err,
            decodedToken
        ) {
            if (err) {
                reject(err);
            } else {
                resolve(decodedToken);
            }
        });
    });
}

exports.verifyToken = verifyToken