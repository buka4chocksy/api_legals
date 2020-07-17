const NextOfKinSchema = require('../../models/common/nextOfKin');
const UserSchema = require('../../models/auth/users');
let jsonPatch = require('fast-json-patch')

const addNextofKinDetails = (publicId, nextofKinData) => {
    console.log(publicId)
    return new Promise((resolve, reject) => {
        const details = {
            public_id: publicId,
            full_name: nextofKinData.full_name,
            phone_number: nextofKinData.phone_number,
            email_address: nextofKinData.email_address,
            relationship: nextofKinData.relationship
        };
        UserSchema.findOne({public_id : details.public_id}).exec((err, foundUser) => {
            if(err || !foundUser){
                resolve({ success: true, message: "user not found", status: 404 })
            }else{
                details.user = foundUser._id

                UserSchema.findOne({email_address : details.email_address}).exec((err, foundNOK) => {
                    if(err || !foundNOK){ 
                        //Log error             
                        NextOfKinSchema.create(details).then(created => {
                            if (created) {
                                resolve({ success: true, message: "Next of kin created successfully", status: 200, data: created });
                            } else {
                                resolve({ success: false, message: "Error creating next of kin" });
                            }
                        }).catch(err => {
                            reject({ err: err, status: 500 })
                        });
                    }else{
                        details.next_of_kin = foundNOK._id
                        details.next_of_kin_id = foundNOK.public_id
                        NextOfKinSchema.create(details).then(created => {
                            if (created) {
                                resolve({ success: true, message: "Next of kin created successfully", status: 200, data: created });
                            } else {
                                resolve({ success: false, message: "Error creating next of kin" });
                            }
                        }).catch(err => {
                            reject({ err: err, status: 500 })
                        });
        
                    }
                })

                

            }
        })

    });
};


const updateNextofKinDetails = (id, publicId , data) => {
    return new Promise((resolve, reject) => {
        console.log(id, publicId )
        NextOfKinSchema.findOne({ _id:id , public_id: publicId }).exec((err, found) => {
            if (err) reject({ err: err, status: 500 });
            if(!found){
                resolve({ success: true, message: 'Next of kin profile not updated',  status: 401 })
            }else{
                let validationError = jsonPatch.validate(data);
                if(validationError){
                    console.log(validationError)
                    resolve({ success: false, message: 'invalid operation', status: 400 });
                }
                
                var updateProfile =  jsonPatch.applyPatch(found.toObject(), data);

                NextOfKinSchema.findOneAndUpdate({_id:id ,public_id:publicId}, updateProfile.newDocument).exec((err , updated)=>{
                    if (err) reject({ err: err, status: 500 });
                    resolve({ success: true, message: 'Next of kin profile updated successfully', status: 200 })
                })
            }

        })
    })
}

const deleteNextofKinDetails = (publicId , id)=>{
    return new Promise((resolve , reject)=>{
        console.log(publicId, id)
        NextOfKinSchema.findOneAndRemove({_id:id , public_id:publicId}).exec((err , deleted)=>{
            if(err)reject({err:err , status:500});
            if(!deleted){
                resolve({success:false , message:"could not delete next of kin details" , status:400})
            }else{
                resolve({success:true , message:"next of kin details deleted successfully" , status:200 })
            }
        })
    })
}

const getUserNextOfKinDetail = (id , publicId)=>{
    return new Promise((resolve , reject)=>{
        NextOfKinSchema.findOne({_id:id , public_id:publicId },{createdAt:0,updatedAt:0 ,__v:0})
        .exec((err , found)=>{
            if(err)reject({err:err , status:500})
            if(found){
                resolve({success:true , message:"next of kin retreived" , data:found , status:200})
            }else{
                resolve({success:false , message:"could not get next of kin details", status:400})
            }
        })
    })
}

const getAllNextofKinDetail = (publicId)=>{
    return new Promise((resolve , reject)=>{
        NextOfKinSchema.find({public_id:publicId},{createdAt:0,updatedAt:0 ,__v:0})
        .exec((err , found)=>{
            if(err)reject({err:err , status:500})
            if(found){
                resolve({success:true , message:"next of kin retreived" , data:found, status:200})
            }else{
                resolve({success:false , message:"could not get next of kin details" , status:404})
            }
        })
    })
}

module.exports = {addNextofKinDetails ,updateNextofKinDetails ,deleteNextofKinDetails ,getUserNextOfKinDetail ,getAllNextofKinDetail}