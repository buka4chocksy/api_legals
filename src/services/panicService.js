// const nextOfKinModel = require('../models/common/nextOfKin');
// const user = require('../models/auth/users');
// const panicModel = require('../models/panic/panicHistory');
// const userSettings = require('../models/common/userSettings');
// const client = require('../models/client/client');
// const lawyer = require('../models/lawyer/lawyer');
// const deactivatePanicModel = require('../models/panic/deactivatedPanic');
// const { sms } = require('../utils/smsUtil');
// //var Redis = require('ioredis');
// const Mongoose = require('mongoose');
// // var redis = new Redis(process.env.NODE_ENV === 'development' ? process.env.REDIS_URL_LOCAL : process.env.REDIS_URL);
// // var sub = new Redis(process.env.NODE_ENV === 'development' ? process.env.REDIS_URL_LOCAL : process.env.REDIS_URL);
// // var pub = new Redis(process.env.NODE_ENV === 'development' ? process.env.REDIS_URL_LOCAL : process.env.REDIS_URL);

// exports.createPanic = async (data, id, user_type) => {
//     try {
//         let find_next_of_kin = await nextOfKinModel.findOne({ public_id: id })
//         if (find_next_of_kin) {
//             return { success: false, message: 'details already exists' };
//         } else {
//             //while creating pannic as client front end will have to pick the usertype data from front end 
//             //but as a lawyer the usertype will come from the database
//             const details = {
//                 next_of_kin: data.next_of_kin,
//                 country_code: data.country_code,
//                 full_name: data.full_name,
//                 phone_number: data.phone_number,
//                 email_address: data.email_address,
//                 relationship: data.relationship,
//                 alert: data.user_type.toLowerCase() !== 'lawyer' ? 'no' : 'yes',
//                 user_type: data.user_type == '' ? user_type : data.user_type,
//                 public_id: id
//             };
//             let create_next_of_kin = await nextOfKinModel.create(details)
//             if (create_next_of_kin) {
//                 if (data.user_type === 'client') {
//                     let update_user_type = await user.findOneAndUpdate({ public_id: id }, { user_type: data.user_type })
//                     if (update_user_type) {
//                         return { success: true, message: 'pannic alert details created successfully', status: 200 }
//                     } else {
//                         return { success: true, message: 'Error creating pannic alert', status: 400 }
//                     }
//                 } else {
//                     return { success: true, message: 'pannic alert details created successfully', status: 200 }
//                 }
//             } else {
//                 return { success: false, message: ' error encountered while creating pannic alert details' }
//             }
//         }
//     } catch (err) {
//         return err
//     }

// };

// exports.getAllPanicAlerts = async () => {
//     try {
//         let find_next_of_kin = await nextOfKinModel.find({})
//         if (find_next_of_kin) {
//             return { success: true, message: find_next_of_kin, status: 200 };
//         } else {
//             return { success: false, message: 'could not find panic alerts', status: 404 };
//         }
//     } catch (err) {
//         return err
//     }
// };

// exports.getPanicAlertById = async (id) => {
//     try {
//         let find_next_of_kin = await nextOfKinModel.findOne({ public_id: id })
//         if (find_next_of_kin) {
//             return { success: true, message: find_next_of_kin, status: 200 };
//         } else {
//             return { success: false, message: 'panic alert detail not found for this user', status: 404 };
//         }
//     } catch (err) {
//         return err
//     }
// };

// exports.getUnresolvedHistory = (id) => {
//     return new Promise((resolve, reject) => {
//         panicModel.findOne({ resolved: false }).or([{ client_id: id }, { lawyer_id: id }])
//             .exec((err, result) => {
//                 var pending;
//                 if (result) {
//                     pending = true;
//                 } else {
//                     pending = false;
//                 }

//                 err ? reject({ success: false, message: err, data: null, status: 500 }) : resolve({ message: "Unresolved alert history", data: { pending, result: result ? result : null }, status: 200 });
//             });
//     });
// };

// exports.getResolvedHistory = async (id) => {
//     try {
//         let resolved_history = await panicModel.find({ resolved: true }).or([{ client_id: id }, { lawyer_id: id }])
//         if (resolved_history) {
//             return { message: "Resolved alert history", data: resolved_history, status: 200, success: true }
//         } else {
//             return { message: err, data: null, status: 500, success: false }
//         }
//     } catch (err) {
//         return err
//     }
// };

// exports.getReceivedHistory = async (id) => {
//     try {
//         let find_panic = await panicModel.find({ lawyer_id: id })
//         if (find_panic) {
//             return { message: "Received alert history", data: find_panic, status: 200, success: true }
//         } else {
//             return { message: err, data: null, status: 500, success: false }
//         }
//     } catch (err) {
//         return err
//     }
// };

// exports.getSentHistory = async (id) => {
//     try {
//         let get_sent_history = await panicModel.find({ client_id: id })
//         if (get_sent_history) {
//             return { message: "Sent alert history", data: get_sent_history, status: 200, success: true }
//         } else {
//             return { message: err, data: null, status: 500, success: false }
//         }
//     } catch (err) {
//         return err
//     }
// };

// exports.getHistory = async (id) => {
//     try {
//         let get_history = await panicModel.find({}).or([{ client_id: id }, { lawyer_id: id }])
//         if (get_history) {
//             return { message: "Panic Alert history", data: get_history, status: 200, success: true }
//         } else {
//             return { message: err, data: null, status: 500, success: false }
//         }
//     } catch (err) {
//         return err
//     }
// };


// exports.getUser = (id) => {
//     return Promise.all([user.findOne({ public_id: id }).lean(), userSettings.findOne({ public_id: id }).lean()]).then(results => {
//         let [foundUser, userSetting] = results;
//         if (foundUser) {
//             if (userSetting && userSetting.device_id) foundUser.device_id = userSetting.device_id;
//             return foundUser;
//         } else {
//             return null;
//         }
//     }).catch(err => {
//         return err
//     });
// };

// exports.createPanicAlert = async (panicDetails) => {
//     try {
//         return await panicModel.create(panicDetails)
//     } catch (err) {
//         return err
//     }
// };

// exports.getNextOfKin = (id) => {
//     return new Promise((resolve, reject) => {
//         nextOfKinModel.find({ public_id: id }).populate('next_of_kin').exec((error, found) => {
//             if (error) reject(error);

//             resolve(found);
//             if (found.length > 0) {
//                 for (index = 0; index < found.length; index++) {
//                     var phone_number = "+234" + found[index].phone_number.split('').slice(1).join('');
//                     const options = {
//                         to: [phone_number],
//                         message: `Yours Kinsmen is calling for help!`
//                     };

//                     sms.send(options)
//                         .then(response => {
//                             if (details.userdeviceid) {
//                                 sub.subscribe(`${details.userdeviceid}`, function (err, count) {
//                                     pub.publish(`${details.userdeviceid}`, `Rider for your ${details.contentdetails} dispatch is enroute`);
//                                 });

//                                 resolve({ message: "The rider is on the way to deliver your package", data: details })
//                             } else {
//                                 resolve({ message: "The rider is on the way to deliver your package", data: details })
//                             }
//                         })
//                         .catch(err => {
//                            reject(err)
//                         });
//                 }
//             }
//         });
//     });
// };

// exports.updateAlertOnMongo = async (alertDetails) => {
//     try {
//         let updatePannic = await panicModel.findOneAndUpdate({ public_id: alertDetails.id, alert_id: alertDetails.alert_id },
//             { $set: { ...alertDetails } }, { new: true })
//         if (updatePannic) {
//             return { message: "pannic alert was updated successfully", status: 200, success: true }
//         } else {
//             return { message: 'error updating pannic alert', status: 500, success: false }
//         }
//     } catch (err) {
//         return err
//     }
// };

// exports.closeAlert = async(alertDetails) => {
//     try {
//         let closeAlert = await panicModel.findOneAndUpdate({ alert_id: alertDetails.alert_id }, { $set: { resolved: true } }, { new: true })
//         if (closeAlert) {
//             return { message: "pannic alert has been closed", success: true, status: 200 }
//         } else {
//             return { message: "error closing pannic alert", success: false, status: 500 }
//         }
//     } catch (err) {
//         return err
//     }

// };


// exports.declareHoax = (alertDetails) => {
//     return new Promise((resolve, reject) => {
//         panicModel.findOne({ alert_id: alertDetails.alert_id }).exec((err, result) => {
//             if (err) reject({ err: err, status: 500 });

//             user.findOneAndUpdate({ public_id: result.client_id }, { $inc: { hoax_alert: 1 } }, { new: true })
//                 .exec((err, completed) => {
//                     if (err) reject({ err: err, status: 500 });

//                     if (completed.hoax > 1) {
//                         user.findOneAndUpdate({ public_id: result.client_id }, { $set: { blocked: true } }, { new: true })
//                             .exec((err, blocked) => {
//                                 if (err) reject({ err: err, status: 500 });

//                                 result.blocked = true;
//                                 resolve(result);
//                             });
//                     } {
//                         result.blocked = false;
//                         resolve(result);
//                     }
//                 });
//         });
//     });
// };

// exports.fetchAllUnresolved = (data) => {
//     return new Promise((resolve, reject) => {
//         panicModel.find({ resolved: false, lawyer_id: data.public_id })
//             .exec((err, result) => {
//                 err ? reject({ message: err, data: null }) : resolve({ message: "Unresolved alert history", data: result });
//             });
//     });
// };

// exports.getAlert = (alert_id) => {
//     return new Promise((resolve, reject) => {
//         panicModel.findOne({ alert_id: alert_id })
//             .exec((err, result) => {
//                 err ? reject({ message: err, data: null }) : resolve({ message: " alert history", data: result });
//             });
//     });
// };


// exports.fetchAllUnresolvedForClient = (data) => {
//     return panicModel.find({ resolved: false, client_id: data.public_id })
//         .exec().then(result => {
//             return { message: "Unresolved alert history", data: result };
//         }).catch(err => {
//             return { message: err, data: null };
//         });
// };

// exports.deactivateAlert = (deactivationDetails) => {
//     return new Promise((resolve, reject) => {
//         user.findOne({ public_id: deactivationDetails.client_id })
//             .select({ "__v": 0, })
//             .exec((err, currentUser) => {
//                 if (err || !currentUser) {
//                     reject({ message: "User not found", status: 404, data: null });
//                 } else {
//                     panicModel.findOneAndUpdate({ client_id: deactivationDetails.client_id, alert_id: deactivationDetails.alert_id }, { $set: { resolved: true } }, { new: true }).exec((err, completed) => {
//                         if (err) reject({ err: err, status: 500 });

//                         deactivatePanicModel.create(deactivationDetails)
//                             .then(result => {
//                                 resolve({ message: "Deactivation successful", status: 200, data: null });
//                             }).catch(error => {
//                                 //use the error logger here
//                                 reject({ message: "Something went wrong", data: null, statusCode: 500 });
//                             });
//                         deleteStoredAlertDetails(deactivationDetails.alert_id);
//                     });
//                 }
//             });
//     });
// };

// const deleteStoredAlertDetails = (alert_id) => {
//     redis.del(alert_id, (err, result) => {
//         redis.lrem("alert_ids", 1, alert_id, (error, result) => {
//             if (error) {
//                 console.error(error);
//             }
//         });
//     });
// };

// const getExistingRequests = () => {
//     return new Promise((resolve, reject) => {
//         redis.lrange("alert_ids", 0, -1, (err, result) => {
//             err ? reject(err) : resolve(result);
//         });
//     });
// };

// const getExistingRequestsDetails = async (result) => {
//     var PromisesToResolve = result.map(data => {
//         return getAllFromRedis(data);
//     });

//     return Promise.all(PromisesToResolve).then(result => {
//         return result;
//     });
// };

// function getAllFromRedis(id) {
//     return new Promise((resolve, reject) => {
//         redis.get(id, (err, result) => {
//             err ? resolve({}) : resolve(JSON.parse(result));
//         });
//     });
// }

// exports.fetchExistingAlerts = () => {
//     return new Promise((resolve, reject) => {
//         getExistingRequests()
//             .then((result) => {
//                 getExistingRequestsDetails(result)
//                     .then((final) => {
//                         resolve(final);
//                     })
//                     .catch((error) => {
//                         reject(error);
//                     });
//             })
//             .catch((error) => {
//                 reject(error);
//             });
//     });
// };

// exports.storeAlertDetails = (alertDetails) => {
//     try {
//         redis.set(`${alertDetails.alert_id}`, JSON.stringify(alertDetails));

//         redis.expire(alertDetails.alert_id, 259200);

//         redis.lpush("alert_ids", alertDetails.alert_id);
//     } catch (error) {
//         return error
//     }
// };

// exports.updateAlertOnRedis = (alertDetails) => {
//     try {
//         redis.set(`${alertDetails.alert_id}`, JSON.stringify(alertDetails));
//         redis.expire(alertDetails.alert_id, 259200);
//     } catch (error) {
//         return error
//     }
// };

// exports.getStoredAlertDetails = (alert_id) => {
//     return new Promise((resolve, reject) => {
//         redis.get(alert_id, (err, result) => {
//             return err ? resolve(null) : resolve(JSON.parse(result));
//         });
//     });
// };

// exports.storePosition = (details) => {
//     try {
//         redis.hmset(details.public_id, "public_id", details.public_id, "user_longitude", details.user_longitude, "user_latitude", details.user_latitude);
//     } catch (error) {
//         return error
//     }
// };

// exports.getStoredPosition = (public_id) => {
//     console.log("GETTING STORED POSITION", public_id);
//     return new Promise((resolve, reject) => {
//         redis.hgetall(public_id, (err, result) => {
//             result ? resolve(result) : console.log(err);
//         });
//     });
// };

// sub.on("message", function (channel, message) {
//     oneSignal.sendNotice(channel, message)
//         .then((res) => {

//         })
//         .catch((error) => {
//            return error
//         });
// });
