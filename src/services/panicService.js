const nextOfKinModel = require('../models/panic/nextOfKin');
const user = require('../models/auth/users');
const panicModel = require('../models/panic/panicHistory')
const deactivatePanicModel = require('../models/panic/deactivatedPanic')
var Redis = require('ioredis');
var redis = new Redis(process.env.NODE_ENV === 'development' ? process.env.REDIS_URL_LOCAL :  process.env.REDIS_URL);
var sub = new Redis(process.env.NODE_ENV === 'development' ? process.env.REDIS_URL_LOCAL :  process.env.REDIS_URL);
var pub = new Redis(process.env.NODE_ENV === 'development' ? process.env.REDIS_URL_LOCAL :  process.env.REDIS_URL);

exports.createPanic = (data,id,usertype)=>{
    return new Promise((resolve , reject)=>{
        nextOfKinModel.findOne({public_id:id}).exec((err , exists)=>{
            if(err)reject({err: err , status:500});
            if(exists){
                resolve({success:false , message:'details already exists' , status:400})
            }else{
                //while creating pannic as client front end will have to pick the usertype data from front end 
                //but as a lawyer the usertype will come from the database
                console.log(data.user_type , 'kgkgkgkgk')
                const details ={
                    next_of_kin:data.next_of_kin,
                    // country_code:data.country_code,
                    phone_number:data.phone_number,
                    email_address:data.email_address,
                    relationship:data.relationship,
                    alert:data.user_type.toLowerCase() !== 'lawyer'? 'no' : 'yes',
                    user_type:data.user_type == '' ? usertype : data.user_type ,
                    public_id:id
                }
                nextOfKinModel.create(details).then(created =>{
                    if(created){
                        if(data.user_type === 'client'){
                            user.findOneAndUpdate({public_id:id}, {user_type:data.user_type}).exec((err , result)=>{
                                if(err)reject({err: err , status:500});
                                if(result){
                                    resolve({success:true , message:'pannic alert details created successfully', status:200}) 
                                }else{
                                    resolve({success:true , message:'Error creating pannic alert' , status:400})
                                }
                            })
                        }else{
                            resolve({success:true , message:'pannic alert details created successfully' , status:200})
                        }
                    }else{
                        resolve({success:false , message:' error encountered while creating pannic alert details', status:400})   
                    }
                }).catch(err => reject({err: err , status:500}))
            }
        })
    })
}

exports.getAllPanicAlerts = ()=>{
    return new Promise((resolve, reject)=>{
        nextOfKinModel.find({}).exec((err, found)=>{
        if(err)reject({err: err , status:500});
        if(found){
            resolve({success:true , message:found , status:200})
        }else{
            resolve({success:false , message:'could not find panic alerts', status:404})
        }
    })      
    })
}

exports.getPanicAlertById = (id)=>{
    return new Promise((resolve , reject)=>{
        nextOfKinModel.findOne({public_id:id}).exec((err , found)=>{
            if(err)reject({err: err , status:500});
            if(found){
                resolve({success:true , message:found , status:200})
            }else{
                resolve({success:false ,message:'panic alert detail not found for this user' , status:404})
            }
        })
    })
}

exports.getUser = (id) => {
    return new Promise((resolve , reject)=>{
        user.findOne({public_id: id}).exec((err , found)=>{
            if(err)reject({err: err , status:500});

            if(!found){
               reject({message: "User does not exist"}) 
            }
            
            resolve(found)
        })
    })
}

exports.createPanicAlert = (panicDetails)=>{
    return new Promise((resolve , reject)=>{
        panicModel.create({public_id: id}).then(created =>{
            resolve()
        }).catch(error => console.log(error))
    })
}

exports.getNextOfKin = (id) => {
    return new Promise((resolve , reject)=>{
        nextOfKinModel.find({public_id: id}).exec((err , found)=>{
            if(error)reject(error)
            
            resolve(found)
        })
    })
}

exports.updateAlertOnMongo = (alertDetails) => {
    return new Promise((resolve , reject)=>{
        panicModel.findOneAndUpdate({public_id: alertDetails.id}, { $set: { ...alertDetails } }, {new: true}).exec((err , completed)=>{
            if(err)reject({err: err , status:500});
            
            resolve(completed)
        })
    })
}

exports.closeAlert = (alertDetails) => {
    return new Promise((resolve , reject)=>{
        panicModel.findOneAndUpdate({alert_id: alertDetails.alert_id}, { $set: { resolved: true } }, {new: true}).exec((err , completed)=>{
            if(err)reject({err: err , status:500});
            
            resolve(completed)
        })
    })
}

exports.declareHoax = (alertDetails) => {
    return new Promise((resolve , reject)=>{
        panicModel.findOne({public_id: alertDetails.id}).exec((err , result)=>{
            if(err)reject({err: err , status:500});
            
            user.findOneAndUpdate({public_id: result.client_id}, { $inc: { hoax: 1 } },{new: true})
            .aggregate([{
                $project: { blocked: { $cond: { if: { $gt: [ "$hoax", 1 ] }, then: true, else: false }} }
            }])
            .exec((err , completed)=>{
                if(err)reject({err: err , status:500});
                
                resolve(result)
            })
        })
    })
}

exports.fetchAllUnresolved = (data) => {
    return new Promise((resolve, reject) => {
        panicModel.find({ resolved: false, lawyer_id: data.lawyer_id })
            .exec((err, result) => {
                err ? reject({ message: err, data: null }) : resolve({ message: "Unresolved alert history", data: result })
            })
    })
}

exports.deactivateAlert = (deactivationDetails) => {
    return new Promise((resolve, reject) => {
        user.findOne({ public_id: deactivationDetails.public_id })
            .select({ "__v": 0,  })
            .exec((err, currentUser) => {
                if (err || !currentUser) {
                    reject({ message: "User not found", statusCode: 404, data: null })
                } else {
                    var validPassword = currentUser.comparePassword(deactivationDetails.password);
                    if (validPassword) {
                        deleteStoredAlertDetails(deactivationDetails.alert_id)

                        deactivatePanicModel.create(deactivationDetails)
                            .then(result => {
                                resolve({ message: "Deactivation successful", data: null });
                            }).catch(error => {
                                //use the error logger here
                                console.error(error)
                                reject({message : "Something went wrong", data : null, statusCode : 500})
                            })
                    } else {
                        reject({ message: "Invalid user credentials", statusCode: 400, data: null });
                    }
                }
            })
    })
}

const deleteStoredAlertDetails = (alert_id) => {
    redis.del(alert_id, (err, result) => {
        redis.lrem("alert_ids", 1, uniqueid, (error, result) => {
            if(error){
                console.error(error)
            }
        })
    })
}

const getExistingRequests = () => {
    return new Promise((resolve, reject) => {
        redis.lrange("alert_ids", 0, -1, (err, result) => {
            err ? reject(err) : resolve(result)
        });
    });
};

const getExistingRequestsDetails = async(result) => {
    var PromisesToResolve = result.map(data => {
        return getAllFromRedis(data);
    });

    return Promise.all(PromisesToResolve).then(result => {
        return result;
    });
};

function getAllFromRedis(id) {
    return new Promise((resolve, reject) => {
        redis.hgetall([id], (err, result) => {
            err ? resolve({}) : resolve(result)
        });
    });
}

exports.fetchExistingAlerts = () => {
    return new Promise((resolve, reject) => {
        getExistingRequests()
            .then((result) => {
                getExistingRequestsDetails(result)
                    .then((final) => {
                        resolve(final)
                    })
                    .catch((error) => {
                        //Logger.error(error)
                        reject(error)
                    })
            })
            .catch((error) => {
                //Logger.error(error)
                reject(error)
            })
    });
};

exports.storeAlertDetails = (alertDetails) => {
    try {
        redis.hmset(alertDetails.alert_id, "alert_id", alertDetails.alert_id, "client_img_url", alertDetails.client_img_url, "alert_id", alertDetails.alert_id, "client_name", alertDetails.client_name, "client_phonenumber", alertDetails.client_phonenumber, "client_email", alertDetails.client_email, 
        "client_id", alertDetails.client_id, "panic_initiation_location", alertDetails.panic_initiation_location, "destination", alertDetails.destination, 
        "resolved", alertDetails.resolved, "alert_type", alertDetails.alert_type, "panic_initiation_latitude", 
        alertDetails.panic_initiation_latitude, "panic_initiation_longitude", alertDetails.panic_initiation_longitude, "status", 
        alertDetails.status, "client_state", client_state, "client_country", client_country)

        redis.expire(alertDetails.alert_id, 259200)

        redis.lpush("alert_ids", alertDetails.alert_id)
    } catch (error) {
        console.log(error)
    }
}

exports.updateAlertOnRedis = (alertDetails) => {
    try {
        redis.hmset(alertDetails.alert_id, "alert_id", alertDetails.alert_id, "lawyer_img_url", alertDetails.lawyer_img_url, "lawyer_name", alertDetails.lawyer_name, "lawyer_phonenumber", alertDetails.lawyer_phonenumber, "lawyer_email", alertDetails.lawyer_email, 
        "lawyer_id", alertDetails.lawyer_id, "lawyer_latitude", 
        alertDetails.lawyer_latitude, "lawyer_longitude", alertDetails.lawyer_longitude, "status", 
        alertDetails.status)
    } catch (error) {
        console.log(error)
    }
}

exports.getStoredAlertDetails = (alert_id) => {
    return new Promise((resolve, reject) => {
        redis.hgetall(alert_id, (err, result) => {
            result ? resolve(result) : console.log(err)
        })
    })
}

exports.storeLawyerPosition = (lawyerDetails) => {
    try {
        redis.hmset(lawyerDetails.lawyer_id, "lawyer_id", lawyerDetails.lawyer_id, "lawyer_longitude", lawyerDetails.lawyer_longitude,
            "lawyerDetails", lawyerDetails.lawyer_latitude)
    } catch (error) {
        console.error(error)
    }
}

exports.getStoredLawyerPosition = (lawyer_id) => {
    return new Promise((resolve, reject) => {
        redis.hgetall(lawyer_id, (err, result) => {
            result ? resolve(result) : console.log(err)
        })
    })
}

    // panic_ending_location: {type: String}