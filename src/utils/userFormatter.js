const lawyer = require('../models/lawyer/lawyer');
const client = require('../models/client/client');

exports.getLawyerId = (id)=>{
    return new Promise((resolve , reject)=>[
        lawyer.findOne({public_id:id}).exec((err, found)=>{
            if(err)reject(err);
            if(found){
                resolve(found._id)
            }else{
                resolve({success:false , message:'lawyer not found'})
            }
        })
    ])
}

exports.getClientId = (id)=>{
    return new Promise((resolve , reject)=>[
        client.findOne({public_id:id}).exec((err, found)=>{
            if(err)reject(err);
            if(found){
                resolve(found._id)
            }else{
                resolve({success:false , message:'client not found'})
            }
        })
    ])
}