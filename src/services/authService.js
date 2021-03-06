const model = require('../models/auth/users');
const bcrypt = require('bcryptjs');
const mailer = require('../middlewares/mailer');
const userToken = require('../models/auth/userToken');
const client = require('../models/client/client');
const lawyer = require('../models/lawyer/lawyer');
const { generateToken, verifyToken, generateTokenSync } = require('../utils/jwtUtils');
const { setRequestHeader } = require('../utils/responseFormatter');
const uuid = require('uuid').v4;
const { applyPatch, validate } = require('fast-json-patch');

exports.Register = (data, res) => {
    console.log("I GOT HERE");
    const userDetails = {
        first_name: data.first_name,
        last_name: data.last_name,
        email_address: data.email_address.toLowerCase(),
        phone_number: data.phone_number,
        password: data.password,
    };
    return model.findOne({ email_address: userDetails.email_address })
        .then(found => {
            if (found) {
                GetNextProcessForIncompleteRegistration(found, res);
                if (found.is_complete == false) {
                    //set the response header to the next place to continue
                    return ({
                        success: true,
                        message: 'select your user path',
                        status: 200,
                        data: found.public_id
                    });
                } else {
                    return ({ success: false, message: 'User already exits, try authenticating to continue', status: 409, data: found.public_id });
                }
            } else {
                return model.create(userDetails).then(created => {
                    if (!created) {
                        return ({ success: false, message: 'Error registering user', status: 400 });
                    }
                    //what is this for?
                    // setRequestHeader(res,created.public_id,"POST", `/auth/${created.public_id}`)
                    GetNextProcessForIncompleteRegistration(created, res);
                    return ({
                        success: true,
                        message: 'Signup almost complete, please choose part ', status: 201, data: created.public_id
                    });
                }).catch(err => {
                    return { err: err, status: 500 };
                });
            }
        }).catch(err => {
            return { err: err, status: 500 };
        });
};

const GetNextProcessForIncompleteRegistration = (userdetails, res) => {
    if (!userdetails.phone_number) {
        //complete oauth registration by providing phone number
        setRequestHeader(res, userdetails.public_id, "POST", `/auth/oauth/addphonenumber/${userdetails.public_id}`, "ADD_PHONE_NUMBER");
    }
    else {
        setRequestHeader(res, userdetails.public_id, "POST", `/auth/${userdetails.public_id}`, "COMPLETE_REGISTRATION");
    }
};

exports.updatePhonenumberForOAuthRegistration = (publicId, phonenumber) => {
    return model.findOneAndUpdate({ public_id: publicId }, { phone_number: phonenumber })
        .then(updated => {
            if (!updated) {
                return { success: false, message: 'current user not found', status: 404 };
            }
            return { success: true, message: 'phone number updated', status: 200, data: publicId };
        });
};

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
                };
                if (clientData.user_type == 'lawyer') {
                    resolve({ success: false, message: 'Sorry you cannot verify your account using this process' });
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
                                                        message: 'authentication successfull '
                                                    });
                                                }).catch(err => reject(err));
                                            }).catch(err => reject(err));
                                        } else {
                                            resolve({
                                                success: false,
                                                message: "Error verifying client "
                                            });
                                        }
                                    }).catch(err => reject(err));

                                } else {
                                    resolve({
                                        success: false,
                                        message: "account verification failed "
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

exports.acceptTerms = (data, id, ipaddress) => {
    return new Promise((resolve, reject) => {
        if (data.accept == 'accept') {
            const usertype = data.user_type;
            const dataForUpdate = { status: true, user_type: usertype, is_complete: true, terms_accepted: true };
            model.findOneAndUpdate({ public_id: id, terms_accepted: null, phone_number: { "$ne": null } }, dataForUpdate, { new: true }).exec((err, updatedUser) => {
                if (err) reject({ err: err, status: 500 });
                if (updatedUser) {
                    let jwtTokenDetails = {
                        email_address: updatedUser.email_address,
                        phone_number: updatedUser.phone_number,
                        public_id: updatedUser.public_id,
                        user_type: updatedUser.user_type,
                    };
                    let userDetails = {
                        ...jwtTokenDetails,
                        first_name: updatedUser.first_name,
                        last_name: updatedUser.last_name,
                        image_url: updatedUser.image_url
                    };

                    if (data.user_type === 'client' || data.user_type === 'student') {
                        createClientUser(userDetails).then(createduser => {
                            generateUserAuthenticationResponse(jwtTokenDetails, updatedUser._id, ipaddress, true).then(result => {
                                resolve({
                                    success: true,
                                    data: { userDetails, authDetails: result.data },
                                    message: 'registration complete',
                                    status: 200
                                });
                            }).catch(err => {
                                reject(err)
                            });
                        });
                    } else {
                        generateUserAuthenticationResponse(jwtTokenDetails, updatedUser._id, ipaddress, true).then(result => {
                            resolve({
                                success: true,
                                data: { userDetails, authDetails: result.data },
                                message: 'registration complete',
                                status: 200
                            });
                        }).catch(err => {
                            reject(err)
                        });
                    }
                } else {
                    resolve({ success: false, message: 'could not accept terms. make sure you have added a valid phone number or you have already accepted our tems of service', status: 404 });
                }
            });
        } else {
            resolve({ success: false, message: 'Terms and policy declined ', status: 401 });
        }
    });
};

const createClientUser = (userDetails) => {
    return new Promise((resolve, reject) => {
        client.findOne({ email_address: userDetails.email_address }).exec((err, foundUser) => {
            if (err) {
                reject(err);
            } else if (!foundUser) {
                client.create(userDetails).then(createdUser => {
                    resolve(createdUser);
                }).catch(err => reject(err));
            } else {
                resolve(foundUser);
            }
        });
    });
};

exports.userLogin = (email_address, password, deviceID, ipaddress, res) => {
    return new Promise((resolve, reject) => {
        model.findOne({ email_address: email_address.toLowerCase() }, { __v: 0, }).then(user => {
            if (!user) resolve({ success: false, message: 'user does not exist', status: 401 });
            else if (user && !user.is_complete) {
                GetNextProcessForIncompleteRegistration(user, res);
                resolve({ success: false, message: 'Sorry you have not accepted the terms and condition', status: 401, data: user.public_id });
            }
            else {
                const validPassword = user.comparePassword(password);
                if (validPassword) {
                    let jwtTokenDetails = {
                        email_address: email_address,
                        phone_number: user.phone_number,
                        public_id: user.public_id,
                        user_type: user.user_type,
                    };
                    let userDetails = {
                        ...jwtTokenDetails,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        image_url: user.image_url
                    };
                    generateUserAuthenticationResponse(jwtTokenDetails, user._id, ipaddress, true).then(result => {
                        resolve({ success: true, data: { userDetails, authDetails: result.data }, message: 'authentication successful', status: 200 });
                    }).catch(err => {
                        reject({ err: err, status: 500 });
                    });
                } else {
                    resolve({ success: false, message: 'incorrect email or password', status: 401 });
                }
            }
        }).catch(err => {
            reject({ err: err, status: 500 });
        });
    });
};

exports.sendForgotPasswordToken = (email_address) => {
    return new Promise((resolve, reject) => {
        const gen = Math.floor(1000 + Math.random() * 9000);
        model.findOne({ email_address }).exec((err, exists) => {
            if (err) reject({ err: err, status: 500 });
            if (exists) {
                model.findOneAndUpdate({ email_address: email_address }, { status_code: gen }).exec((err, updated) => {
                    if (err) reject({ err: err, status: 500 });
                    if (updated) {
                        mailer.forgortPasswordMailer(email_address, gen, function (err, sent) {
                            if (err) reject({ err: err, status: 500 })
                            if (sent) {
                                resolve({ success: true, message: 'proceed to verifying the token ', status: 200, data: null })
                            }
                        });

                        resolve({ success: true, message: 'proceed to verifying the token ', status: 200, data: null });
                    }
                });
            } else {
                resolve({ success: false, message: 'user does not exists ', status: 404 });
            }
        });
    });
};

exports.verifyUserOtp = (details) => {
    return new Promise((resolve, reject) => {

        model.findOne({ email_address: details.email_address })
            .select({ "__v": 0, "password": 0 })
            .exec((err, currentUser) => {
                if (err) reject({ message: "Database error", status: 500, data: err });

                if (currentUser) {
                    if (currentUser.status_code === details.status_code) {
                        resolve({ success: true, message: "OTP verification successful", data: { verified: true }, status: 200 });
                    } else {
                        resolve({ success: false, message: "Incorrect OTP", status: 400 });
                    }
                } else {
                    resolve({ success: false, message: "User details not found", status: 400 });
                }
            });
    });
};

//user password change
exports.changePassword = (id, data) => {
    return new Promise((resolve, reject) => {
        model.findOne({ public_id: id }).then(exists => {
            if (exists) {
                const db_password = exists.password;
                const old_password = data.password;
                const new_password = bcrypt.hashSync(data.comfirm_password, 10);
                const compare_password = bcrypt.compareSync(old_password, db_password);
                if (compare_password == true) {
                    model.findOneAndUpdate({ public_id: id }, { password: new_password })
                        .then(updated => {
                            if (updated) {
                                resolve({ success: true, message: 'Password updated successfully !!', status: 200 });
                            } else {
                                resolve({ success: false, message: 'Password was not updated successfully !!', status: 400 });
                            }
                        }).catch(err => reject({ err: err, status: 500 }));
                } else {
                    resolve({ success: false, message: 'Invalid password inserted ', status: 400 });
                }
            } else {
                resolve({ success: false, message: 'user does not exists ', status: 404 });
            }
        }).catch(err => reject({ err: err, status: 500 }));
    });
};

exports.changeForgotPassword = (data) => {
    return new Promise((resolve, reject) => {
        if (data.password === data.confirm_password) {
            let newpassword = bcrypt.hashSync(data.password, 10);
            model.findOneAndUpdate({ email_address: data.email_address }, { password: newpassword }).exec((err, updated) => {
                if (err) reject({ err: err, status: 500 });
                if (updated) {
                    resolve({ success: true, message: 'User password has been changed successfully', status: 200 });
                } else {
                    resolve({ success: false, message: 'Error changing password ', status: 404 });
                }
            });
        } else {
            resolve({ success: false, message: 'Password fields does not match', status: 400 });
        }

    });
};

function DBupdateToken(id, tokenID, deviceID, ip_address) {
    return new Promise((resolve, reject) => {
        let details = {
            userId: id,
            tokenID: tokenID,
            deviceID: deviceID,
            ip_address: ip_address
        };

        userToken.findOne({ $and: [{ userId: id }, { deviceID: deviceID }] }).exec((err, found) => {
            if (err) reject({ success: false, err: err, status: 500 });
            if (found) {
                userToken.findOneAndUpdate({ $and: [{ deviceID: deviceID, userId: id }] }, { tokenID: tokenID }).exec((err, updated) => {
                    if (err) reject({ success: false, err: err, status: 500 });
                    if (updated) {
                        resolve({ success: true, message: 'User token updated successfully', status: 200, data: tokenID });
                    } else {
                        resolve({ success: false, message: 'Error updating user token ' });
                    }
                });
            } else {
                userToken.create(details).then(created => {
                    if (created) {
                        resolve({ success: true, message: 'User token created  successfully', status: 200, token: tokenID });
                    } else {
                        resolve({ success: false, message: 'Error creating user token', status: 400 });
                    }
                });
            }
        });
    });
}

exports.DBupdateToken = DBupdateToken;

exports.refreshToken = (details, ipaddress) => {
    return new Promise((resolve, reject) => {
        model.findOne({ public_id: details.public_id }, { __v: 0, }).then(user => {
            if (!user) {
                resolve({ success: false, message: 'User does not exist', status: 404, data: null });
            }
            let jwtTokenDetails = {
                email_address: details.email_address,
                phone_number: user.phone_number,
                public_id: details.public_id,
                user_type: details.user_type,
            };
            let userDetails = {
                ...jwtTokenDetails,
                first_name: details.first_name,
                last_name: user.last_name,
                image_url: user.image_url
            };

            generateUserAuthenticationResponse(jwtTokenDetails, user._id, ipaddress, true).then(result => {
                resolve({ success: true, data: { userDetails, authDetails: result.data }, message: 'authentication successful', status: 200 });
            }).catch(err => {
                reject({ err: err, status: 500 });
            });
        }).catch(err => {
            reject({ err: err, status: 500 });
        });
    });
};

//get user details
function getUserDetail(Id) {
    return new Promise((resolve, reject) => {
        model.findOne({ public_id: Id }, { _id: 0, __v: 0, password: 0, })
            .then(data => {
                resolve(data);
            })
            .catch(error => reject(error));
    });
}
exports.getUserDetail = getUserDetail;

const generateUserAuthenticationResponse = (userData, userId, ipaddress, islogin = true) => {
    let accessToken = generateTokenSync(userData);
    var expiryTime = new Date();
    expiryTime = expiryTime.setUTCDate(expiryTime.getDate() + 7);

    var dataForSave = {
        user: userId,
        phone_number: userData.phone_number,
        public_id: userData.public_id,
        access_token: accessToken,
        expiry_time: expiryTime,
        callback_token: uuid(),
        ip_address: ipaddress,
        $inc: { refresh_count: 1 }
    };
    return addOrUpdateUserAuthenticationToken(dataForSave, userId);
};

const addOrUpdateUserAuthenticationToken = (refreshDetail, userId) => {
    return new Promise((resolve, reject) =>
        userToken.findOneAndUpdate({ user: userId }, refreshDetail, {
            select: {
                user: 0,
                refresh_count: 0, __v: 0,
                is_browser: 0,
                device_id: 0,
                soft_delete: 0
            }, new: true, upsert: true
        }).exec((err, result) => {
            if (err) { resolve({ status: 401, success: false, data: null, message: 'Could not authenticate user' }); }
            else {
                resolve({
                    success: true, data: {
                        ...result.toObject()
                    }, message: 'Authentication successful'
                });
            }
        }));
};

exports.confimPassword = (public_id, password) => {
    return new Promise((resolve, reject) => {
        model.findOne({ public_id: public_id })
            .select({ "__v": 0, })
            .exec((err, currentUser) => {
                if (err || !currentUser) {
                    reject({ message: "User not found", status: 404, data: null });
                } else {

                    if (!currentUser.password) {
                        reject({ message: "You logged in with either linkedin or google account and not allowed to use deactivate a panic", status: 400, data: { verified: false } });
                    } else {
                        var validPassword = currentUser.comparePassword(password);

                        if (!validPassword) {
                            reject({ message: "Wrong password", status: 400, data: { verified: false } });
                        } else {
                            resolve({ message: "Verification successful", status: 200, data: { verified: true } });
                        }
                    }

                }
            });
    });
};

exports.generateUserAuthenticationResponse = generateUserAuthenticationResponse;
exports.createClientUser = createClientUser;
exports.GetNextProcessForIncompleteRegistration = GetNextProcessForIncompleteRegistration;



