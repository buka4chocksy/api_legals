const model = require('../models/pannicButton');

exports.createPannic = (data,id , usertype)=>{
    return new Promise((resolve , reject)=>{
        model.findOne({public_id:id}).exec((err , exists)=>{
            if(err)reject(err);
            if(exists){
                resolve({success:false , message:'details already exists'})
            }else{
                const details ={
                    next_of_kin:data.next_of_kin,
                    country_code:data.country_code,
                    phone_number:data.phone_number,
                    email:data.email,
                    relationship:data.relationship,
                    alert:data.alert,
                    user_type:usertype,
                    public_id:id
                }
                model.create(details).then(created =>{
                    if(created){
                        resolve({success:true , message:'pannic alert details created successfully'})
                    }else{
                        resolve({success:false , message:' error encountered while creating pannic alert details'})   
                    }
                }).catch(err => reject(err));
            }
        })
    })
}

exports.getAllPannicAlerts = ()=>{
    return new Promise((resolve, reject)=>{
    model.find({}).exec((err, found)=>{
        if(err)reject(err);
        if(found){
            resolve({success:true , message:found})
        }else{
            resolve({success:false , message:'could not find panic alerts'})
        }
    })      
    })
}

exports.getPannicAlertById = (id)=>{
    return new Promise((resolve , reject)=>{
        model.findOne({public_id:id}).exec((err , found)=>{
            if(err)reject(err);
            if(found){
                resolve({success:true , message:found})
            }else{
                resolve({success:false ,message:'panic alert detail not found for this user'})
            }
        })
    })
}