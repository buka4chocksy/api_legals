const model = require('../models/lawyer/pannicButton');
const user = require('../models/auth/users');
exports.createPannic = (data,id,usertype)=>{
    return new Promise((resolve , reject)=>{
        model.findOne({public_id:id}).exec((err , exists)=>{
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
                model.create(details).then(created =>{
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

exports.getAllPannicAlerts = ()=>{
    return new Promise((resolve, reject)=>{
    model.find({}).exec((err, found)=>{
        if(err)reject({err: err , status:500});
        if(found){
            resolve({success:true , message:found , status:200})
        }else{
            resolve({success:false , message:'could not find panic alerts', status:404})
        }
    })      
    })
}

exports.getPannicAlertById = (id)=>{
    return new Promise((resolve , reject)=>{
        model.findOne({public_id:id}).exec((err , found)=>{
            if(err)reject({err: err , status:500});
            if(found){
                resolve({success:true , message:found , status:200})
            }else{
                resolve({success:false ,message:'panic alert detail not found for this user' , status:404})
            }
        })
    })
}