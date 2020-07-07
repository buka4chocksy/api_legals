const model = require('../models/auth/users');
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose');
const mailer = require('../middlewares/mailer');
const secret = process.env.Secret
const userToken = require('../models/auth/userToken');
const client = require('../models/client/client');
const jwt = require('jsonwebtoken');
const {setRequestHeader} = require('../utils/responseFormatter');
exports.Register = (data, deviceID, res) => {
    const userDetails = {
        first_name: data.first_name,
        last_name: data.last_name,
        email_address: data.email_address,
        phone_number: data.phone_number,
        password: data.password,
    }
        return model.findOne({ email_address: userDetails.email_address })
        .then(found => {
            if (found) {
                setRequestHeader(res,found.public_id,"POST", `/auth/${found.public_id}`)
                if (found.status == false) {
                    //set the response header to the next place to continue
                    return ({
                        success: true,
                        message: 'complete signup process',
                        status: 200,
                        data : found.public_id
                    })
                } else {
                    return ({ success: false, message: 'User already exits', status: 409 })
                }
            } else {
                return model.create(userDetails).then(created => {
                    if (!created) {
                         //log error message
                        return ({ success: false, message: 'Error registering user', status: 400 })
                    }
                    setRequestHeader(res,created.public_id,"POST", `/auth/${created.public_id}`)
                    return ({
                        success: true,
                        message: 'Signup almost complete, please choose part ', status: 200, data :created.public_id
                    })
                }).catch(err => { 
                    return { err: err, status: 500 } 
                })
            }
        }).catch(err => {
            return { err: err, status: 500 } 
        });
    
}

exports.updatePhonenumberForOAuthRegistration = (publicId, phonenumber) => {
    console.log("public id check", publicId, phonenumber);
    return  model.findOneAndUpdate({ public_id: publicId }, { phone_number: phonenumber })
    .then(updated => {
        if (!updated) {
            // throw new Error('Error updating this user!!!');
            //create logger here
            return { success: false, message: 'current user not found', status: 404 }
        }
        return {success: false, message: 'phone number updated', status: 200, data : publicId}
    })
}


const UpdateCreatedRegistrationDetails = (token, phone_number) => {
    return  verifyToken(token).then(decode => {
        console.log("in here", decode)
        return model.findOneAndUpdate({ public_id: decode.publicId }, { phone_number: phone_number })
        .then(updated => {
            if (!updated) {
                // throw new Error('Error updating this user!!!');
                //create logger here
                return { success: false, message: 'User updated successfully', status: 500 }
            }
            return ({ decode, updated })
        })
    }).catch(err => ({ success: false, message: err.message, status: 401 }))
        .then(({ decode, updated }) => {
            console.log("check error")
            return DBupdateToken(decode.publicId, token, deviceID);
        })
        .catch(err => Promise.reject({ err: err, status: 500 }))
        .then((tokenUpdated = {}) => {
            if (tokenUpdated.success) {
                return { success: true, message: 'User updated successfully', status: 200 };
            } else {
                return { success: true, message: 'Could not update token', status: 404 };
            }
        })
}



//user verification 
exports.verifyUser = (email, option) => {
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
                    public_id: found.public_id
                }
                if (clientData.user_type == 'lawyer') {
                    resolve({ success: false, message: 'Sorry you cannot verify your account using this process' })
                } else {
                    if (found.status_code == option.status_code) {
                        model
                            .findOneAndUpdate({ email_address: email }, { status: true })
                            .then(updated => {
                                if (updated) {
                                    client.create(clientData).then(created => {
                                        if (created) {
                                            getUserDetail(found.public_id).then(activeUser => {
                                                generateToken(activeUser).then(token => {
                                                    resolve({
                                                        success: true, data: { activeUser, token: token },
                                                        message: 'authentication successfull !!!'
                                                    })
                                                }).catch(err => reject(err))
                                            }).catch(err => reject(err))
                                        } else {
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

exports.acceptTerms = (data, id) => {
    return new Promise((resolve, reject) => {
        console.log("data check", data);
        if (data.accept == 'accept') {
            const usertype = data.user_type;
            const dataForUpdate = { status: true, user_type: usertype }
            usertype === 'lawyer' ? dataForUpdate.is_complete = false :  dataForUpdate.is_complete = true; 
            console.log("data for update", dataForUpdate);
            model.findOneAndUpdate({ public_id: id,is_complete : false, phone_number : {"$ne" : null} },dataForUpdate , {new : true}).exec((err, updatedUser) => {
                console.log("errro check", err, updatedUser);
                if (err) reject({ err: err, status: 500 });
                if (updatedUser) {
                    const clientData = {
                        first_name: updatedUser.first_name,
                        last_name: updatedUser.last_name,
                        email_address: updatedUser.email_address,
                        phone_number: updatedUser.phone_number,
                        user_type: updatedUser.user_type,
                        public_id: updatedUser.public_id,
                        phone_number : updatedUser.phone_number
                    }
                    if (data.user_type === 'client' || data.user_type === 'student') {
                            client.create(clientData).then(createdUser => {
                                console.log("creating client", createdUser);
                                if (createdUser) {
                                        generateToken(createdUser).then(token => {
                                            resolve({
                                                success: true, data: { userDetails : {...clientData}, token: token },
                                                message: 'registration complete',
                                                status: 201
                                            })
                                        }).catch(err => {
                                            console.log("error creating", err);
                                            reject({ err: err, status: 500 })
                                        })
                                } else {
                                    resolve({ success: false, message: 'Error creating user', status: 401 })
                                }
                            }).catch(err => reject({ err: err, status: 500 }))
                    } else {
                        resolve({success : true, status : 201, data : updatedUser.public_id});
                        // getUserDetail(id).then(activeUser => {
                        //     generateToken(activeUser).then(token => {
                        //         resolve({
                        //             success: true, data: { activeUser, token: token },
                        //             message: 'authentication successfull !!!',
                        //             status: 200
                        //         })
                        //     }).catch(err => reject({ err: err, status: 500 }))
                        // }).catch(err => reject({ err: err, status: 500 }))
                    }
                } else {
                    resolve({ success: false, message: 'could not accept terms. make sure you have added a valid phone number', status: 404 })
                }
            })
        } else {
            resolve({ success: false, message: 'Terms and policy declined !!!', status: 401 })
        }
    })
}

exports.userLogin = (email_address, password, deviceID) => {
    return new Promise((resolve, reject) => {
        model.findOne({ email_address: email_address }, { _id: 0, __v: 0, }).then(user => {
            if (user) {

                if (user.status !== true) {
                    resolve({
                        success: false,
                        message: 'Sorry you have not accepted the terms and condition!!!',
                        status: 401
                    })

                } else {
                    const comparePassword = bcrypt.compareSync(password, user.password)
                    if (comparePassword) {
                        getUserDetail(user.public_id).then(activeUser => {
                            generateToken(activeUser).then(token => {
                                DBupdateToken(user.public_id, token, deviceID).then(updated => {
                                    if (updated) {
                                        resolve({
                                            success: true, data: { activeUser, token: token },
                                            message: 'authentication successfull !!!',
                                            status: 200
                                        })
                                    } else {
                                        resolve({ success: false, message: "Error encountered while logging in !!!" })
                                    }
                                }).catch(err => reject({ err: err, status: 500 }))

                            }).catch(err => reject({ err: err, status: 500 }))
                        }).catch(err => reject({ err: err, status: 500 }))
                    } else {
                        resolve({ success: false, message: 'incorrect email or password ', status: 400 })
                    }
                }

            } else {
                resolve({ success: false, message: 'user does not exist !!!', status: 404 })
            }
        }).catch(err => {
            reject({ err: err, status: 500 })
        })
    })
}

exports.sendPasswordChangeToken = (data) => {
    return new Promise((resolve, reject) => {
        const gen = Math.floor(1000 + Math.random() * 9000);
        model.findOne({ email_address: data.email_address }).exec((err, exists) => {
            if (err) reject({ err: err, status: 500 })
            if (exists) {
                model.findOneAndUpdate({ email_address: data.email_address }, { status_code: gen }).exec((err, updated) => {
                    if (err) reject({ err: err, status: 500 })
                    if (updated) {
                        mailer.forgortPasswordMailer(data.email_address, gen, function (err, sent) {
                            if (err) reject({ err: err, status: 500 })
                            if (sent) {
                                resolve({ success: true, message: 'proceed to verifying the token !!!', status: 200 })
                            } else {
                                resolve({ success: false, message: 'Error verifying your email!!!', status: 400 })
                            }
                        })
                    }
                })
            } else {
                resolve({ success: false, message: 'user does not exists !!!', status: 404 })

            }
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
                                resolve({ success: true, message: 'Password updated successfully !!', status: 200 })
                            } else {
                                resolve({ success: false, message: 'Password was not updated successfully !!', status: 400 })
                            }
                        }).catch(err => reject({ err: err, status: 500 }))
                } else {
                    resolve({ success: false, message: 'Invalid password inserted !!!', status: 400 })
                }
            } else {
                resolve({ success: false, message: 'user does not exists !!!', status: 404 })
            }
        }).catch(err => reject({ err: err, status: 500 }));
    })
}

exports.ChangeforgotPassword = (data) => {
    return new Promise((resolve, reject) => {
        model.findOne({ status_code: data.status_code }).exec((err, found) => {
            if (err) reject({ err: err, status: 500 })
            if (found) {
                let userEmail = found.email_address
                let newpassword = bcrypt.hashSync(data.password, 10)
                model.findOneAndUpdate({ email_address: userEmail }, { password: newpassword }).exec((err, updated) => {
                    if (err) reject({ err: err, status: 500 })
                    if (updated) {
                        resolve({ success: true, message: 'user password has been changed successfully!!!', status: 200 })
                    } else {
                        resolve({ success: false, message: 'Error changing password !!!', status: 404 })

                    }
                })
            } else {
                resolve({ success: false, message: 'Invalid token inserted !!!', status: 404 })
            }
        })
    })
}


function DBupdateToken(id, tokenID, deviceID) {
    return new Promise((resolve, reject) => {
            let  details = {
                userId:id,
                tokenID: tokenID,
                deviceID: deviceID
            }
        
        userToken.findOne({ $and: [{ userId: id }, { deviceID: deviceID }] }).exec((err, found) => {
            if (err) reject({ success: false, err: err, status: 500 });
            if (found) {
                userToken.findOneAndUpdate({$and:[{deviceID: deviceID,  userId:id }] }, { tokenID: tokenID }).exec((err, updated) => {
                    if (err) reject({ success: false, err: err, status: 500 });
                    if (updated) {
                        resolve({ success: true, message: 'User token updated successfully', status: 200  , data:tokenID})
                    } else {
                        resolve({ success: false, message: 'Error updating user token !!!' })
                    }
                })
            }else{
                userToken.create(details).then(created =>{
                    if(created){
                        resolve({ success: true, message: 'User token created  successfully', status: 200  , token:tokenID})  
                    }else{
                        resolve({ success: false , message: 'Error creating user token', status: 400 })
                    }
                })
            }
        })
    })
}

exports.DBupdateToken = DBupdateToken

exports.refreshToken = (device) => {
    return new Promise((resolve, reject) => {
        userToken.findOne({deviceID:device})
        .exec((err , result)=>{
             if (err) reject({ success: false, err: err, status: 500 });
            if(result){
                getUserDetail(result.userId).then(activeUser => {
                       generateToken(activeUser).then(token => {
                       DBupdateToken(result.userId, token, device).then(update => {
                       if (update) {
                       resolve({ success: true, status: 200, token: token, message: "user token updated" })
                       } else {
                       resolve({ success: false, status: 400, message: 'error updating user token' })
                       }
                      })
                      }).catch(err => reject({ err: err, status: 500 }))
                     }).catch(err => reject({ err: err, status: 500 }))
            }else{
                resolve({success:false , message:"could not find device ", status:404})
            }
        })
    })
}

//get user details
function getUserDetail(data) {
    return new Promise((resolve, reject) => {

        model.findOne({ public_id: Id }, { _id: 0, __v: 0 })
            .then(data => {
                var specificUserDetail = {
                    email_address: data.email_address,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    fullname: data.first_name + ' ' + data.last_name,
                    phone_number: data.phone_number,
                    publicId: data.public_id,
                    user_type: data.user_type,
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
        jwt.sign({ ...data }, secret, { expiresIn: 60*60 }, function (err, token) {
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
                reject({ message: 'Token has expired', status: 400 });
            } else {
                resolve(decodedToken);
            }
        });
    });
}

exports.verifyToken = verifyToken