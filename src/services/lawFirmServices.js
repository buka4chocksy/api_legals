const mongoose = require('mongoose');
const model = require('../models/firms/lawFirm');
const lawFirmlawyers = require('../models/firms/firmLawyers')
const firmpracticeArea = require('../models/firms/FirmpracticeArea');
const lawfirmAdmin = require('../models/firms/admin');
const lawyerFormatter = require('../utils/userFormatter');

const lawyers = require('../models/lawyer/lawyer');
exports.createLawFirm = (id, data) => {
    return new Promise((resolve, reject) => {
        lawyerFormatter.getLawyerId(id).then(result => {
            if (result) {
                const details = {
                    public_id: id,
                    lawyer_id: result,
                    name_of_firm: data.name_of_firm,
                    contact_email: data.contact_email,
                    website_url: data.website_url,
                    contact_phone_number: [{
                        phone_number: data.contact_phone_number
                    }],
                    location: [{
                        country_Id: data.country,
                        state_Id: data.state,
                        address: data.address
                    }],
                }
                model.findOne({ name_of_firm: details.name_of_firm, contact_email: details.contact_email }).exec((err, exists) => {
                    if (err) reject({ err: err, status: 500 });
                    if (exists) {
                        resolve({ success: false, message: 'lawfirm already exists !!!', status: 404 })
                    } else {
                        model.create(details).then(created => {
                            if (created) {
                                let lawfrimId = created._id
                                lawFirmlawyers.find({ $and: [{ firm: lawfrimId }, { lawyer: data.lawyer }] }).exec((err, found) => {
                                    if (err) reject({ err: err, status: 500 });
                                    if (found) {
                                        let details = {
                                            firm: lawfrimId,
                                            lawyer: data.lawyer
                                        }
                                        lawFirmlawyers.create(details).then(sent => {
                                            if (sent) {
                                            firmpracticeArea.find({ $and: [{ firm: lawfrimId }, { practice_area: data.practice_area }] }).exec((err , exists)=>{
                                                if (err) reject({ err: err, status: 500 });
                                                if(exists){
                                                    let datas = {
                                                        firm: lawfrimId,
                                                        practice_area: data.practice_area
                                                    }
                                                    firmpracticeArea.create(datas).then(created=>{
                                                        if(created){
                                                            resolve({ success: true, message: 'lawfirm created successfully', status: 200 })

                                                        }else{
                                                            resolve({ success: false, message: 'Error created firm', status: 401 })

                                                        }
                                                    }).catch(err => ({ success: false, message: err.message, status: 401 }))
                                                }
                                            })
                                            } else {
                                                resolve({ success: false, message: 'Error created firm', status: 401 })
                                            }
                                        }).catch(err => ({ success: false, message: err.message, status: 401 }))

                                    }
                                })
                            } else {
                                resolve({ success: false, message: 'error creating lawfirm', status: 401 })
                            }
                        }).catch(err => ({ success: false, message: err.message, status: 401 }))

                    }
                })
            } else {
                resolve({ success: false, message: 'lawyer not found !!', status: 404 })
            }
        }).catch(err => ({ success: false, message: err.message, status: 401 }))


    })
}

//profile picture update
exports.uploadProfilePicture = (id, firmId, data) => {
    return new Promise((resolve, reject) => {
        const detail = {
            image_url: data.imageUrl,
            image_id: data.imageID
        }
        model.findOneAndUpdate({ public_id: id, _id: firmId }, detail).exec((err, updated) => {
            if (err) reject({ err: err, status: 500 });
            if (updated) {
                resolve({ success: true, message: 'profile picture updated ', status: 200 })
            } else {
                resolve({ success: false, message: 'Error updating profile picture', status: 401 })
            }
        })
    })
}

//get lawfirm profile
exports.getLawFirmProfile = (id, firmId) => {
    return new Promise((resolve, reject) => {
        model.findOne({ public_id: id, _id: firmId })
            .populate({ path: 'lawyer_id', model: 'lawyer', select: { _id: 0, __v: 0 } })
            .populate({ path: "practice_area.practice_area_id", model: 'practiceArea', select: { _id: 0, __v: 0 } })
            .populate({ path: "jurisdiction.jurisdiction_id", model: 'jurisdiction', select: { _id: 0, __v: 0 } })
            .populate({ path: "lawyers.lawyer_Id", model: 'lawyer', select: { _id: 0, __v: 0 } })
            .populate({ path: "location.country_Id", model: 'jurisdiction', select: { _id: 0, __v: 0 } })
            .populate({ path: "location.state_Id", model: 'jurisdiction', select: { _id: 0, __v: 0 } })
            .exec((err, exists) => {
                if (err) reject({ err: err, status: 500 });
                if (exists) {
                    resolve({ success: true, message: 'lawfirms', data: exists, status: 200 })
                } else {
                    resolve({ success: false, message: 'could not find lawfirm', status: 404 })
                }
            })
    })
}

//get list of lawfirms
exports.lawyerLawFirmList = (id, pagenumber = 1, pagesize = 20) => {
    return new Promise((resolve, reject) => {
        model.find({ public_id: id }).skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
            .populate({ path: 'lawyer_id', model: 'lawyer', select: { _id: 0, __v: 0 } })
            .populate({ path: "practice_area.practice_area_id", model: 'practiceArea', select: { _id: 0, __v: 0 } })
            .populate({ path: "jurisdiction.jurisdiction_id", model: 'jurisdiction', select: { _id: 0, __v: 0 } })
            .populate({ path: "lawyers.lawyer_Id", model: 'lawyer', select: { _id: 0, __v: 0 } })
            .populate({ path: "location.country_Id", model: 'jurisdiction', select: { _id: 0, __v: 0 } })
            .populate({ path: "location.state_Id", model: 'jurisdiction', select: { _id: 0, __v: 0 } })
            .exec((err, found) => {
                if (err) reject(err);
                if (found) {
                    var maps = found.sort(function (a, b) {
                        return b.name_of_firm.length - a.name_of_firm.length;

                    })
                    resolve({ success: true, message: 'lawfirms found', data: maps, status: 200 })
                } else {
                    resolve({ success: false, message: 'could not find list of lawfirms', status: 404 })
                }
            })
    })
}

exports.getSinglelawfirm = (id)=>{
    return new Promise((resolve , reject)=>{
        model.findById({_id:id}).exec((err, result)=>{
            if (err) reject({ err: err, status: 500 });
            if(result){
                resolve({success:true , message:"lawfirm found", data:result , status:200})
            }else{
                resolve({success:false , message:"Could not find lawfirm",status:404 })
            }
        })
    })
}

exports.addAdmin = (id, firmId, data) => {
    var adminsToAdd = data.admins.map(x => mongoose.Types.ObjectId(x));
    return new Promise((resolve, reject) => {
            model.aggregate([
                {"$match" : {_id : mongoose.Types.ObjectId(firmId)}},
                {"$lookup" :  {
                    from :"firmlawyers",
                    pipeline : [
                        {
                            "$match" : {"$expr" :  { "$in" : ["$lawyer", adminsToAdd]}}
                        },
                        {'$project' : {lawyer : 1, _id : 0}}
                    ],
                    as : "firm_lawyers"
                }},
                {"$project" : {"firm_lawyers": 1 }},
                {"$lookup" : {
                    from : 'admins',
                    let : {firm_lawyers : "$firm_lawyers"},
                    pipeline : [
                        { "$match" : {"$expr" : {_id : mongoose.Types.ObjectId(firmId)}}},
                        {
                            "$match" : {"$expr" :  { "$in" : ["$lawyer", adminsToAdd]}}
                        },
                        {'$project' : {lawyer : 1, _id : 0}}
                    ],
                    as : 'admins_to_add'
                }},
                {"$project": {
                    "firm_lawyers" : 1,
                    "admins_to_add" : {
                        "$filter" : {
                            input :  "$admins_to_add",
                            as :"admin",
                            cond : {"$in" : ["$$admin.lawyer","$firm_lawyers.lawyer" ]}
                        }
                    }
                   
                }}
            ]).exec((err, result) => {
                if(err){
                    resolve({status : 404, data : null, success : false, message : 'could not find requested firm'});
                }else{

                    //we get the result at index 0 because we expect every firm to have a unique id even though we aggregated

                    var currentFirmDetails = result[0];
                    var firmNonAdmins = currentFirmDetails.firm_lawyers.filter(x=>{
                        var isAdmin = currentFirmDetails.admins_to_add.findIndex(y => {
                          return   y.lawyer.toString() == x.lawyer.toString()
                        });
                        if(isAdmin<0){
                            return x;
                        }
                    })

                    //now use firmNonAdmins to save the admins to the database
                    if(firmNonAdmins.length > 0){
                        var newAdmins = firmNonAdmins.map(x => ({lawyer : mongoose.Types.ObjectId(x.lawyer),
                            firm : firmId}));
                       lawfirmAdmin.insertMany(newAdmins, (err, result) => {
                           console.log(err);
                           if(err){
   
                           }else{
                               resolve({status : 201, data : null,message : 'admin added'});
                           }
                       })
                    }else{
                        resolve({status : 201, data : null,message : 'admin added'});
                    }
                   
                }
            })
    })
}

exports.addlawFirmLawyer = (publicId,firmId, data)=>{
    return new Promise((resolve, reject)=>{
        lawyers.findOne({public_id:publicId}).exec((err , isLawyer)=>{
            if (err) reject({ err: err, status: 500 });
            if(isLawyer){
                let lawyerId = isLawyer._id
                lawfirmAdmin.findOne({$and:[{firm:firmId},{lawyer:lawyerId}]}).exec((err , isAdmin)=>{
                    if (err) reject({ err: err, status: 500 });
                    if(isAdmin){
                        lawFirmlawyers.findOne({$and:[{firm:firmId},{lawyer:data.lawyer}]}).exec((err , exists)=>{
                            if (err) reject({ err: err, status: 500 });
                            if(exists){
                                resolve({success:false  , message:"Sorry lawyer already exists in this lawfirm", status:400})
                            }else{
                                let details ={firm:firmId,lawyer:data.lawyer}
                                lawFirmlawyers.create(details).then(created =>{
                                    if(created){
                                        resolve({success:true  , message:"this lawyer has been successfully add this lawfirm", status:200})
                                    }else{
                                        resolve({success:false , message:"Error adding this lawyer to lawfirm", status:400})
                                    }
                                }).catch( err => reject({err:err , status:500}))
                            }
                           })
                    }else{
                        resolve({success:false , message:"Sorry you are not an admin in this lawfrim and cannot add lawyers to this lawfirm " , status:400})
                    }
                })
            }else{
                resolve({success:false , message:"Lawyer does not exist", status:400}) 
            }
        })
    })
}

exports.addLocation =(id,firmid ,data)=>{
    return new Promise((resolve , reject)=>{
        model.findOne({$and:[{public_id:id },{_id:firmid}, {"location.country_Id":data.country_Id},
         {"location.state_Id":data.state_Id}, {"location.address":data.address}] }).exec((err , found)=>{
            if (err) reject({ err: err, status: 500 });
            if(!found){
                model.findOneAndUpdate({$and:[{public_id:id},{_id:firmid} ]},{$push:{location:data}}).exec((err , updated)=>{
                    if (err) reject({ err: err, status: 500 });
                    if(updated){
                        resolve({success:true , message:"location added successfully", status:200})
                    }else{
                        resolve({success:true , message:"error encountered while adding location", status:400})
                    }
                })
            }else{
                resolve({success:false , message:"Sorry address already exists to this particular lawfirm " , status:401})
            }
        })
    })
}

//get list of lawfirms
exports.lawFirmList = (pagenumber = 1, pagesize = 20) => {
    return new Promise((resolve, reject) => {
        model.find({}).skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
            .populate({ path: 'lawyer_id', model: 'lawyer', select: { _id: 0, __v: 0 } })
            .populate({ path: "practice_area.practice_area_id", model: 'practiceArea', select: { _id: 0, __v: 0 } })
            .populate({ path: "jurisdiction.jurisdiction_id", model: 'jurisdiction', select: { _id: 0, __v: 0 } })
            .populate({ path: "lawyers.lawyer_Id", model: 'lawyer', select: { _id: 0, __v: 0 } })
            .populate({ path: "location.country_Id", model: 'jurisdiction', select: { _id: 0, __v: 0 } })
            .populate({ path: "location.state_Id", model: 'jurisdiction', select: { _id: 0, __v: 0 } })
            .exec((err, found) => {
                if (err) reject({ err: err, status: 500 });
                if (found) {
                    var maps = found.sort(function (a, b) {
                        return b.name_of_firm.length - a.name_of_firm.length;

                    })
                    resolve({ success: true, message: 'lawfirms found', data: maps, status: 200 })
                } else {
                    resolve({ success: false, message: 'could not find list of lawfirms', status: 404 })
                }
            })
    })
}

exports.sortLawFirmBypracticeArea = (id, pagenumber = 1, pagesize = 20) => {
    return new Promise((resolve, reject) => {
        model.find({ 'practice_area.practice_area_id': id })
            .skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
            .populate({ path: 'lawyer_id', model: 'lawyer', select: { _id: 0, __v: 0, password: 0, status_code: 0, created_at: 0 } })
            .populate({ path: 'practice_area.practice_area_id', model: 'practiceArea' })
            .exec((err, found) => {
                if (err) reject({ err: err, status: 500 });
                if (found) {
                    var maps = found.sort(function (a, b) {
                        return b.name_of_firm.length - a.name_of_firm.length;

                    })
                    resolve({ success: true, message: 'lawfirms found', data: maps, status: 200 })
                } else {
                    resolve({ success: false, message: 'Could  not find data', status: 404 })
                }
            })
    })
}

exports.sortLawFirmByLocation = (data, pagenumber = 1, pagesize = 20) => {
    return new Promise((resolve, reject) => {
        model.find({ 'country.country_name': data.country, 'state.state_name': data.state })
            .skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
            .populate({ path: 'lawyer_id', model: 'lawyer', select: { _id: 0, __v: 0, password: 0, status_code: 0, created_at: 0 } })
            .populate({ path: 'practice_area.practice_area_id', model: 'practiceArea' })
            .exec((err, found) => {
                if (err) reject(err);
                if (found) {
                    var maps = found.sort(function (a, b) {
                        return b.name_of_firm.length - a.name_of_firm.length;

                    })
                    resolve({ success: true, message: 'lawfirms found', data: maps, status: 200 })
                } else {
                    resolve({ success: false, message: 'Could  not find data', status: 404 })
                }
            })
    })
}


exports.searchLawfirm = function (option) {
    return new Promise((resolve, reject) => {
        model.find({ name_of_firm: { $regex: option.search, $options: 'i' } }, { _id: 0, __v: 0 })
            .populate({ path: 'lawyer_id', model: 'lawyer', select: { _id: 0, __v: 0, password: 0, status_code: 0, created_at: 0 } })
            .exec((err, found) => {
                if (err) { reject(err); }
                if (found == null || Object.keys(found).length === 0) {
                    resolve({ success: false, data: {}, message: "We could not find what you are looking for.", status: 404 })
                } else {
                    var maps = found.sort(function (a, b) {
                        return b.name_of_firm.length - a.name_of_firm.length;

                    })
                    resolve({ success: true, data: maps, message: "", status: 200 });
                }
            })
    })
}

exports.getFirmLawyers = (firmId)=>{
    return new Promise((resolve , reject)=>{
        lawFirmlawyers.find({firm:firmId})
        .populate({ path: 'lawyer', model: 'lawyer', select: {  __v: 0, password: 0, status_code: 0, created_at: 0 } })
        .exec((err , found)=>{
            if (err) reject({ err: err, status: 500 });
            if(found){
                resolve({success:true , message:"firm lawyers", data:found , status:200})
            }else{
                resolve({success:false , message:"no lawyer for this firm at the moment", status:404})
            }
        })
    })
}

exports.getFirmAdmins= (firmId)=>{
    return new Promise((resolve , reject)=>{
        lawfirmAdmin.find({firm:firmId})
        .populate({ path: 'lawyer', model: 'lawyer', select: {  __v: 0, password: 0, status_code: 0, created_at: 0 } })
        .exec((err , found)=>{
            if (err) reject({ err: err, status: 500 });
            if(found){
                resolve({success:true , message:"firm Admins", data:found , status:200})
            }else{
                resolve({success:false , message:"no Admin for this firm at the moment", status:404})
            }
        })
    })
}

exports.addFirmPracticeArea = (Firmpractiareas , firmId)=>{
    return new Promise((resolve , reject)=>{
        let convert = Firmpractiareas.practice_area.split(",")
       firmpracticeArea.find({$and:[{firm:firmId}, {practice_area:convert}] }).exec((err , found)=>{    
           console.log(found)  
        // if (err) reject({ err: err, status: 500 });
        // if(found){
        // }else{
        //     resolve({success:false , message:"lawfirm does not exist", status:404})

        // }
       })
    })
}