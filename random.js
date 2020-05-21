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
        // complete signup for oauth Users
        return verifyToken(data.token).then(decode => {
            return model.findOneAndUpdate({ public_id: decode.publicId }, { phone_number: data.phone_number }).then(updated => {
                if (!updated) {
                    throw new Error('Error updating this user!!!');
                }
                return ({ decode, updated });
            });
        })
            .catch(err => ({ success: false, message: err.message, status: 401 }))
            .then(({ decode, updated }) => {
                return DBupdateToken(decode.publicId, data.token, deviceID);
            })
            .catch(err => ({ err: err, status: 500 }))
            .then((tokenUpdated = {}) => {
                if (tokenUpdated.success) {
                    return { success: true, token: data.token, message: 'User updated successfully', status: 200 };
                } else {
                    return { success: true, message: 'Could not update token', status: 404 };
                }
            });
    } else {
        return model.findOne({ email_address: userDetails.email_address }).then(found => {
            if (found) {
                //when a lawyer has created a user profile but didnt complete his signup
                if (found.status == false) {
                    return ({
                        success: true,
                        message: 'please complete your signup process',
                        status: 200
                    })
                } else {
                    return ({ success: false, message: 'User already exists please proceed to sign in !!!', status: 400 })
                }
            } else {
                return model.create(userDetails).then(created => {
                    if (!created) {
                        return ({ success: false, message: 'Error registering user !!', status: 400 });
                    }

                    const user_id = created.public_id;
                    return getUserDetail(user_id).then(user => {
                        return generateToken(user);
                    })
                        .then(token => {
                            //after signup is complete the user token is updated to the user db
                            return this.DBupdateToken(user_id, token, deviceID);
                        })
                        .catch(err => reject({ err: err, status: 401 }))
                        .then(tokenUpdated => {
                            if (tokenUpdated) {
                                return ({
                                    success: true, data: token,
                                    message: 'Signup almost complete, please choose part ', status: 200
                                })
                            } else {
                                return ({
                                    success: true,
                                    message: 'could not update token ', status: 404
                                })
                            }
                        }).catch(err => reject({ err: err, status: 401 }))

                }).catch(err => console.log("error is 2 - ", err), reject({ err: err, status: 500 }));
            }
        }).catch(err => console.log("error is 3 - ", err), reject({ err: err, status: 500 }));
    }

}