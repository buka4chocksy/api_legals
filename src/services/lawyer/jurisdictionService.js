const JurisdictionModel = require('../../models/lawyer/lawyerJurisdiction');
const UserModel = require('../../models/auth/users');
const { applyOperation, validate } = require('fast-json-patch');
const {uploadToCloud, deleteFromCloud} = require('../../utils/cloudinaryUtil');

//fix this to check if the jurisdiction am adding already exist
const addlawyerJurisdiction =  (jurisdictionData, file) => {
    return new Promise((resolve, reject) => {
        UserModel.findOne({ public_id: jurisdictionData.public_id }).exec( async (err, foundUser) => {
            if (err || !foundUser) {
                //log error here
                resolve({ success: false, message: 'user not found', status: 404 });
            }

            //console.log("FOUND USER", foundUser)

            let dataToSave = {
                user: foundUser._id,
                public_id: foundUser.public_id,
                jurisdiction_id: jurisdictionData.jurisdiction_id,
                enrolment_number : jurisdictionData.enrolment_number
            };

            if(file){
                //save to cloudinary first
                var cloudResult =   await uploadToCloud(file.path, "lawyercerts");

                if(cloudResult){
                    dataToSave.certificate = [{
                        certificate_url: cloudResult.url, 
                        certificate_secure_url : cloudResult.secure_url,
                        certificate_id: cloudResult.asset_id,
                        certificate_delete_token : cloudResult.delete_token,
                        certificate_resource_type : cloudResult.resource_type,
                        certificate_public_id: cloudResult.public_id
                    }];    
                }
                
                //why delete?
                delete dataToSave.enrolment_number;
            }
    
            JurisdictionModel.create(dataToSave).then(result => {
                resolve ({ success: true, message: 'jurisdiction added', status: 201, data : result })
            }).catch(error => {
                //log error here
                console.log(error)
                reject ({ success: false, message: 'could not add jurisdiction', status: 500 });
            })
    
        });
    })
};

const getalawyerJurisdiction = (publicId) => {
    console.log(publicId)
    return new Promise((resolve, reject)=>{
        JurisdictionModel.findOne({public_id : publicId}).exec((err, foundData) => {
            if(err){
                resolve({ success: false, message: 'jurisdiction found', status: 404, data: null });
            }
            resolve({ success: true, message: 'jurisdiction retrieved', status: 200, data : foundData });
        })
    }) 
};

const updateLawyerJurisdiction = (publicId, jurisdictionId, patchUpdateData) => {
    return new Promise((resolve, reject)=>{
        JurisdictionModel.findOne({public_id : publicId}).exec((err, foundJurisdiction) =>{
            if(err || !foundJurisdiction){
                resolve({ success: false, message: 'jurisdiction not found', status: 404 });
            }

            //console.log(foundJurisdiction)
            // let validationError = validate(patchUpdateData);
            // if(validationError){
            //     console.log(validationError)
            //     resolve({ success: false, message: 'invalid operation', status: 400 });
            // }

            // console.log("jurisdiction check", validationError)
            let appliedPatch = applyOperation(foundJurisdiction.toObject(), patchUpdateData);
            console.log("new data", appliedPatch.newDocument)
            JurisdictionModel.findOneAndUpdate({_id : jurisdictionId, public_id : publicId}, appliedPatch.newDocument, {new : true }).exec((err, updatedData) => {
                if(err || !updatedData){
                    resolve({ success: false, message: 'could not add jurisdiction', status: 404, data : null });
                }
                resolve({success : true, message : 'jurisdiction updated', status : 200, data : updatedData });
            })
        })
    }) 
};

const deleteJurisdictionFile = (publicId, jurisdictionId, certificate_id ) => {
    //make a call to cloudinary and delete file first
    return new Promise(async(resolve, reject)=>{
        JurisdictionModel.findOneAndUpdate({ public_id: publicId, jurisdiction_id: jurisdictionId }, { $pull: { "certificate": { certificate_id: certificate_id } } }, { upsert: false, new: true }, async (err, updated) => {
            if(err){
                //Logger.error(err)
                reject({message: err, statusCode: 500, data: null})
            }
            
            resolve({ success: true, message: 'Jurisdiction file removed', status: 201, data : updated })
            var response = await deleteFromCloud(certificate_id)
            if(response){
                console.log("-----------------------------DONE")
            }  
        });  
    })
}

const addJurisdictionFile = (jurisdictionData, file) => {
    return new Promise(async (resolve, reject) => {

            var certificate = {}

            if(file){
                //save to cloudinary first
                var cloudResult =   await uploadToCloud(file.path, "lawyercerts");

                if(cloudResult){
                    certificate = {
                        certificate_url: cloudResult.url, 
                        certificate_secure_url: cloudResult.secure_url,
                        certificate_id: cloudResult.asset_id,
                        certificate_delete_token: cloudResult.delete_token,
                        certificate_resource_type: cloudResult.resource_type,
                        certificate_public_id: cloudResult.public_id
                    };    
                }
            }
    
            JurisdictionModel.findOneAndUpdate({ public_id: jurisdictionData.public_id, jurisdiction_id: jurisdictionData.jurisdiction_id }, { $push: { "certificate": certificate } }, { upsert: true, new: true }, (err, updated) => {
                if(err){
                    //Logger.error(err)
                    reject({success: false, message: err, statusCode: 500, data: null})
                } 
                    
                resolve({ success: true,message: "Certificate added successfully", status: 200, data: updated })
            });    
    })
  }

  module.exports = {
    addlawyerJurisdiction, getalawyerJurisdiction, updateLawyerJurisdiction, deleteJurisdictionFile, addJurisdictionFile
  }