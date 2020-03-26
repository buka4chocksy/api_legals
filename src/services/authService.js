const model = require('../models/users');
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose');
const mailer = require('../middlewares/mailer');
const secret = process.env.Secret
const lawyer = require('../models/lawyer');
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
                if (found.user_type == 'lawyer') {
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
                        resolve({ success: false, message: 'User already exists please proceed to sign in !!!' })
                    }
                } else {
                    resolve({ success: false, message: 'User already exists!!!' })
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
                                    resolve({ success: true, message: 'Registration successfull , proceed to verify ur account !!' })
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
exports.verifyUser = option => {
    return new Promise((resolve, reject) => {
        model
            .findOne({ email_address: option.email_address })
            .then(found => {
                if (found.status_code == option.status_code) {
                    model
                        .findOneAndUpdate({ email_address: option.email_address }, { status: true })
                        .then(updated => {
                            if (updated) {
                                resolve({
                                    success: true,
                                    message: "account verification completed !!!"
                                });
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
            })
            .catch(err => {
                reject(err);
            });
    });
};

//user login
exports.userLogin = (email_address, password) => {
    return new Promise((resolve, reject) => {
        model.findOne({ email_address: email_address }, { _id: 0, __v: 0, }).then(user => {
            if (user) {
                if (user.status != true) reject({ success: false, message: 'account not verified !!!' })
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
                const new_password = bcrypt.hashSync(data.new_password, 10)

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

//profile picture update
exports.profilePicture = (id, data) => {
    return new Promise((resolve, reject) => {
        const detail = {
            image_url: data.imageUrl,
            image_id: data.imageID
        }
        model.findOneAndUpdate({ public_id: id }, detail).exec((err, updated) => {
            if (err) reject(err);
            if (updated) {
                resolve({ success: true, message: 'profile picture updated ' })
            } else {
                resolve({ success: false, message: 'Error updating profile picture' })
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