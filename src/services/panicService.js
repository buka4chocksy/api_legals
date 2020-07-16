const nextOfKinModel = require('../models/common/nextOfKin');
const user = require('../models/auth/users');
const panicModel = require('../models/panic/panicHistory')
const client = require('../models/client/client')
const lawyer = require('../models/lawyer/lawyer')
const deactivatePanicModel = require('../models/panic/deactivatedPanic')
const { sms } = require('../utils/smsUtil')
var Redis = require('ioredis');
var redis = new Redis(process.env.NODE_ENV === 'development' ? process.env.REDIS_URL_LOCAL :  process.env.REDIS_URL);
var sub = new Redis(process.env.NODE_ENV === 'development' ? process.env.REDIS_URL_LOCAL :  process.env.REDIS_URL);
var pub = new Redis(process.env.NODE_ENV === 'development' ? process.env.REDIS_URL_LOCAL :  process.env.REDIS_URL);

exports.createPanic = (data,id,user_type)=>{
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
                    user_type:data.user_type == '' ? user_type : data.user_type ,
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
        user.findOne({public_id: id}).exec((err , foundUser)=>{
            if(err)reject({err: err , status:500});
            // console.log("FOUND USER", foundUser, foundUser.user_type)

            if(!foundUser){
               reject({message: "User does not exist"}) 
            }
            
            //re-write to use aggregate
            if(foundUser.user_type === "lawyer"){
                lawyer.findOne({public_id: id}).exec((err , found)=>{
                    if(err)reject({err: err , status:500});

                    // console.log("FOUND", found)

                    if(!found){
                       reject({message: "Lawyer does not exist"}) 
                    }

                    // foundUser.client_country = found.state_of_origin
                    // foundUser.client_state = found.country 
                    
                    resolve(foundUser)
                })
            }
            
            if(foundUser.user_type === "client"){
                client.findOne({public_id: id}).exec((err , found)=>{
                    if(err)reject({err: err , status:500});

                    // console.log("FOUND", found)

                    if(!found){
                       reject({message: "Client does not exist"}) 
                    }

                    foundUser.client_country = found.state_of_origin
                    foundUser.client_state = found.country 
                    
                    resolve(foundUser)
                })
            }
        })
    })
}

exports.createPanicAlert = (panicDetails)=>{
    return new Promise((resolve , reject)=>{
        panicModel.create(panicDetails).then(created => {
            resolve()
        }).catch(error => console.log(error))
    })
}

exports.getNextOfKin = (id) => {
    return new Promise((resolve , reject)=>{
        nextOfKinModel.find({public_id: id}).exec((error , found)=>{
            if(error)reject(error)
    
            resolve(found)

            for(index=0; index<found.length; index++){
                const options = {
                    to: [`${found[index].phone_number}`],
                    message: `Someone who you are a next of kin to needs a great help`
                }
    
                sms.send(options)
                    .then(response => {
                        // if (details.userdeviceid) {
                        //     sub.subscribe(`${details.userdeviceid}`, function (err, count) {
                        //         pub.publish(`${details.userdeviceid}`, `Rider for your ${details.contentdetails} dispatch is enroute`);
                        //     });
    
                        //     resolve({ message: "The rider is on the way to deliver your package", data: details })
                        // } else {
                            // resolve({ message: "The rider is on the way to deliver your package", data: details })
                        // }
                    })
                    .catch(error => {
                        console.error(error)
                    });
            }
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
            console.log("Errror", err, completed)
            if(err)reject({err: err , status:500});
            
            resolve(completed)
        })
    })
}

exports.declareHoax = (alertDetails) => {
    return new Promise((resolve , reject)=>{
        panicModel.findOne({alert_id: alertDetails.alert_id}).exec((err , result)=>{
            if(err)reject({err: err , status:500});
            
            user.findOneAndUpdate({public_id: result.client_id}, { $inc: { hoax_alert: 1 } },{new: true})
            .exec((err , completed)=>{
                console.log("HOAX NUMBER", completed.hoax_alert)
                if(err)reject({err: err , status:500});
                
                if(completed.hoax > 1){
                    user.findOneAndUpdate({public_id: result.client_id}, { $set: { blocked: true } },{new: true})
                    .exec((err , completed)=>{
                        if(err)reject({err: err , status:500});
                        
                        if(completed.hoax > 1){
                            
                        }
                        resolve(result)
                    })
                }
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
        "client_id", alertDetails.client_id, "panic_initiation_location", alertDetails.panic_initiation_location, "destination", alertDetails.destination, "resolved", alertDetails.resolved, "alert_type", alertDetails.alert_type, "panic_initiation_latitude", alertDetails.panic_initiation_latitude, 
        "panic_initiation_longitude", alertDetails.panic_initiation_longitude, "status", alertDetails.status, "client_state", alertDetails.client_state, 
        "client_country", alertDetails.client_country, "next_of_kin", alertDetails.next_of_kin)

        redis.expire(alertDetails.alert_id, 259200)

        redis.lpush("alert_ids", alertDetails.alert_id)
    } catch (error) {
        console.log(error)
    }
}

exports.updateAlertOnRedis = (alertDetails) => {
    console.log("I UPDATED THE ALERT DETAILS")
    try {
        redis.hmset(alertDetails.alert_id, "alert_id", alertDetails.alert_id, "lawyer_img_url", alertDetails.lawyer_img_url, "lawyer_name", alertDetails.lawyer_name, "lawyer_phonenumber", alertDetails.lawyer_phonenumber, "lawyer_email", alertDetails.lawyer_email, 
        "lawyer_id", alertDetails.lawyer_id, "lawyer_latitude", alertDetails.lawyer_latitude, "lawyer_longitude", alertDetails.lawyer_longitude, "client_img_url", alertDetails.client_img_url, "alert_id", alertDetails.alert_id, "client_name", alertDetails.client_name, "client_phonenumber", alertDetails.client_phonenumber, "client_email", alertDetails.client_email, "client_id", alertDetails.client_id, "panic_initiation_location", alertDetails.panic_initiation_location, "destination", alertDetails.destination, "resolved", alertDetails.resolved, "alert_type", alertDetails.alert_type, "panic_initiation_latitude", 
        alertDetails.panic_initiation_latitude, "panic_initiation_longitude", alertDetails.panic_initiation_longitude, "status", alertDetails.status, 
        "client_state", alertDetails.client_state, "client_country", alertDetails.client_country, "next_of_kin", alertDetails.next_of_kin)
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

exports.storePosition = (details) => {
    try {
        redis.hmset(details.id, "id", details.id, "longitude", details.longitude, "latitude", details.latitude)
    } catch (error) {
        console.error(error)
    }
}

exports.getStoredPosition = (lawyer_id) => {
    return new Promise((resolve, reject) => {
        redis.hgetall(lawyer_id, (err, result) => {
            result ? resolve(result) : console.log(err)
        })
    })
}

// panic_ending_location: {type: String}