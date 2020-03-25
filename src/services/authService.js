const model = require('../models/users');
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose');
const mailer = require('../middlewares/mailer');
const secret = process.env.Secret
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
                resolve({ success: false, message: 'User already exists!!!' })
            } else {
                model.create(userDetails).then(created => {
                    if (created) {
                        mailer.SignUpMail(userDetails.email_address, userDetails.status_code, userDetails.first_name, userDetails.last_name).then(sent => {
                            if (sent) {
                                resolve({ success: true, message: 'Registration successfull , proceed to verify ur account !!' })
                            } else {
                                resolve({ success: false, message: 'Error encountered while signing up !!' })
                            }
                        }).catch(err => reject(err));
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
exports.userLogin = (email_address , password)=>{
    return new Promise((resolve , reject)=>{
        model.findOne({email_address:email_address}, { _id: 0, __v: 0  , }).then(user =>{
            if(user){
                if(user.status != true)reject({success:false , message:'account not veririfed !!!'})
                const comparePassword = bcrypt.compareSync(password , user.password)
                if(comparePassword){
                    getUserDetail(user.publicId).then(activeUser =>{
                        generateToken(activeUser).then(token =>{
                            resolve({success:true , data:{activeUser , token:token },
                            message:'authentication successfull !!!'
                            })
                        }).catch(err => reject(err))
                    }).catch(err => reject(err))
                }else{
                    resolve({success:false , message:'incorrect email or password '})
                }
            }else{
                resolve({success:false , message:'user does not exist !!!'})  
            }
        }).catch(err =>{
            reject(err)
        })
    })
}

//user password change
exports.changePassword = (email , data)=>{
    return new Promise((resolve , reject)=>{
        model.findOne({email_address:email}).then(exists =>{
            if(exists){
                const db_password = exists.password
                const old_password = data.password
                const new_password = bcrypt.hashSync(data.comfirm_password ,10)

                const compare_password = bcrypt.compareSync(old_password ,db_password)
                if(compare_password == true){
                    model.findOneAndUpdate({email_address:email},{password: new_password})
                    .then(updated =>{
                        if(updated){
                            resolve({success:true , message:'Password updated successfully !!'})
                        }else{
                            resolve({success:false , message:'Password was not updated successfully !!'})
                        }
                    }).catch(err => reject(err))
                }else{
                    resolve({success:false , message:'Invalid password inserted !!!'})
                }
            }else{
                resolve({success:false , message:'user does not exists !!!'})
            }
        }).catch(err => reject(err));
    })
}

//get user details
function getUserDetail(Id) {
    return new Promise((resolve, reject) => {

      model.findOne({publicId: Id }, { _id: 0, __v: 0 })
        .then(data => {
          var specificUserDetail = {
            email_address: data.email_address,
            fullname: data.first_name +' '+ data.last_name, 
            phone: data.phone_number,
            publicId: data.public_id,
            userType: data.user_type,
            status:data.status
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
      jwt.sign({ ...data }, secret, { expiresIn: "24hrs" }, function(err, token) {
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
          jwt.verify(token.replace("Bearer", ""), secret, function(
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