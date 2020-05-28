const model = require('../models/users');
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose');
// const mailer = require('../middlewares/mailer');
const secret = process.env.Secret
const client = require('../models/client');
const jwt = require('jsonwebtoken');


exports.Register = (data, deviceID) => {
        const hash = data.password ? bcrypt.hashSync(data.password, 10) : undefined;
        const gen = Math.floor(1000 + Math.random() * 9000);
        const check = data.hasOwnProperty('token');
        const userDetails = {
            first_name: data.first_name,
            last_name: data.last_name,
            email_address: data.email_address,
            phone_number: data.phone_number,
            status_code: gen,
            password: hash,
            public_id: mongoose.Types.ObjectId(),
        }
        if (check) {
            return verifyToken(data.token).then(decode => {
                return model.findOneAndUpdate({ public_id: decode.publicId }, { phone_number: data.phone_number }).then(updated => {
                    if(!updated) {
                        throw new Error('Error updating this user!!!');
                    }
                    return ({decode, updated})
                })
            })
            .catch(err => ({ success: false, message: err.message, status: 401 }))
            .then(({decode, updated}) => {
                return DBupdateToken(decode.publicId, data.token, deviceID);
            })
            .catch(err => reject({err: err, status: 500}))
            .then((tokenUpdated ={}) => {
                if (tokenUpdated.success) {
                    return { success: true, token: data.token, message: 'User updated successfully', status: 200 };
                } else {
                    return { success: true, message: 'Could not update token', status: 404 };
                }
            })
        } else {
            return model.findOne({ email_address: userDetails.email_address }).then(found => {
                if(found) {
                    if(found.status == false) {
                        return ({
                            success: true,
                            message: 'please complete your signup process',
                            status: 200
                        })
                    } else {
                        return ({ success: false, message: 'User already exits please proceed to sign in !!!', status: 404 })
                    }
                } else {
                    return model.create(userDetails).then(created => {
                        if(!created) {
                            return ({ success: false, message: 'Error registering user !!', status: 400 })
                        }
                        const user_id = created.public_id;
                        return getUserDetail(user_id).then(user => { // Q starts
                            return generateToken(user);
                        })
                        .then(token => {
                            return DBupdateToken(user_id, token, deviceID)
                        })
                        .catch(err => {return { err: err, status: 401 }}) // Q Ends
                        .then(tokenUpdated => {
                            if(tokenUpdated) {
                                return ({
                                    success: true, token: tokenUpdated.token,
                                    message: 'Signup almost complete, please choose part ', status: 200
                                })
                            } else {
                                return ({
                                    success: true,
                                    message: 'could not update token ', status: 404
                                })
                            }
                        }).catch(err => {return { err: err, status: 500 }})
                    }).catch(err => {return { err: err, status: 500 }})
                }
            }).catch(err => {return { err: err, status: 500 }}); // Q
        }
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
        if (data.accept == 'accept') {
            console.log( data.user_type , 'see this')

            const usertype = data.user_type == 'client' ? 'client' : 'lawyer'
            model.findOneAndUpdate({ public_id: id }, { status: true, user_type: usertype }).exec((err, updated) => {
                if (err) reject({ err: err, status: 500 });
                if (updated) {
                    if (data.user_type === 'client') {
                        model.findOne({ public_id: id }).then(user => {
                            const clientData = {
                                first_name: user.first_name,
                                last_name: user.last_name,
                                email_address: user.email_address,
                                phone_number: user.phone_number,
                                user_type: data.user_type,
                                public_id: user.public_id
                            }
                            client.create(clientData).then(created => {
                                if (created) {
                                    getUserDetail(id).then(activeUser => {
                                        generateToken(activeUser).then(token => {

                                            resolve({
                                                success: true, data: { activeUser, token: token },
                                                message: 'authentication successfull !!!',
                                                status: 200
                                            })
                                        }).catch(err => reject({ err: err, status: 500 }))
                                    }).catch(err => reject({ err: err, status: 500 }))
                                } else {
                                    resolve({ success: false, message: 'Error creating user', status: 401 })
                                }
                            }).catch(err => reject({ err: err, status: 500 }))
                        }).catch(err => reject({ err: err, status: 500 }))
                    } else {

                        getUserDetail(id).then(activeUser => {
                            generateToken(activeUser).then(token => {
                                resolve({
                                    success: true, data: { activeUser, token: token },
                                    message: 'authentication successfull !!!',
                                    status: 200
                                })
                            }).catch(err => reject({ err: err, status: 500 }))
                        }).catch(err => reject({ err: err, status: 500 }))
                    }
                } else {
                    resolve({ success: false, message: 'Error updating user policy!!!', status: 401 })
                }
            })
        } else {
            resolve({ success: false, message: 'Terms and policy declined !!!', status: 401 })
        }
    })
}

//user login
exports.userLogin = (email_address, password) => {
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
                                resolve({
                                    success: true, data: { activeUser, token: token },
                                    message: 'authentication successfull !!!',
                                    status: 200
                                })
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

// function DBupdateToken(id, tokenID, deviceID) {
//     return new Promise((resolve, reject) => {
//         let details = {
//             token: [{
//                 tokenID: tokenID,
//                 deviceID: deviceID
//             }]
//         }
//         model.findOne({ public_id: id }).exec((err, found) => {

//             if (err) return reject({ success: false, err: err, status: 500 });
//             let existing = found.token

//             let reesult = existing.filter(a => a.tokenID === tokenID && a.deviceID === deviceID ? a : null)

//             if (reesult.length > 0) {
//                 resolve({ success: false, message: 'token already exists', status: 400 })
//             } else {
//                 model.findOneAndUpdate({ public_id: id }, { $push: { token: details.token } }).exec((err, updated) => {
//                     if (err) reject({ success: false, err: 'err1', status: 500 });
//                     else if (updated) {
//                         resolve({ success: true, message: 'token details updated !!', status: 200, token: tokenID })
//                     } else {
//                         resolve({ success: false, message: 'Error updating token ', status: 400 })
//                     }

//                 })
//             }

//         })

//     })
// }

function DBupdateToken(id, tokenID, deviceID) {
    return new Promise((resolve, reject) => {
        let details = {
            token: {
                tokenID: tokenID,
                deviceID: deviceID
            }
        }
        model.findOne({ public_id: id }).exec((err, found) => {

            if (err) return reject({ success: false, err: err, status: 500 })
                model.findOneAndUpdate({ public_id: id }, { $set: { token: details.token } }).exec((err, updated) => {
                    if (err) reject({ success: false, err: 'err1', status: 500 });
                    else if (updated) {
                        resolve({ success: true, message: 'token details updated !!', status: 200, token: tokenID })
                    } else {
                        resolve({ success: false, message: 'Error updating token ', status: 400 })
                    }

                })

        })

    })
}
exports.DBupdateToken = DBupdateToken

exports.refreshToken = (token, device) => {
    return new Promise((resolve, reject) => {
        model.findOne({ token: { $elemMatch: { tokenID: token, deviceID: device } } }).exec((err, result) => {
            if (err) reject({ success: false, err: err, status: 500 });
            if (!result) {
                resolve({ success: false, message: 'user does not exist', status: 400 })
            } else {
                // console.log(result , 'wereewwwww')
                let specificToken = result.token
                let tokenResult = specificToken.filter(a => a.tokenID === token && a.deviceID === device ? a : null)
                if (tokenResult !== null) {
                    let userId = result.public_id

                    getUserDetail(userId).then(activeUser => {
                        generateToken(activeUser).then(token => {
                            tokenResult[0].tokenID = token;
                            result.save((err, saved) => {
                                if (err) reject({ err: err, status: 400, message: 'Error saving token' })
                                resolve({
                                    success: true, token: token,
                                    message: 'refresh token generated  !!!',
                                    status: 200
                                })
                            })

                        }).catch(err => reject({ err: err, status: 500 }))
                    }).catch(err => reject({ err: err, status: 500 }))
                } else {
                    resolve({ status: false, status: 400, message: 'un-authorized access' })
                }

            }
        })
    })
}


//get user details
function getUserDetail(Id) {
    return new Promise((resolve, reject) => {

        model.findOne({ public_id: Id }, { _id: 0, __v: 0 })
            .then(data => {
                var specificUserDetail = {
                    email_address: data.email_address,
                    first_name: data.first_name,
                    last_name: data.last_name,
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
        jwt.sign({ ...data }, secret, { expiresIn: "56 mins" }, function (err, token) {
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