const JurisdictionModel = require('../../models/lawyer/lawyerJurisdiction');
const Jurisdiction = require('../../models/lawyer/jurisdiction')
const UserModel = require('../../models/auth/users');
const { applyPatch } = require('fast-json-patch');
const { uploadToCloud, deleteFromCloud } = require('../../utils/cloudinaryUtil');
const jurisdiction = require('../../models/lawyer/jurisdiction');
const { findOne } = require('../../models/auth/users');


//fix this to check if the jurisdiction am adding already exist
const addlawyerJurisdiction = (public_id, jurisdictionData, file) => {
    return new Promise((resolve, reject) => {
        UserModel.findOne({ public_id: public_id }).exec(async (err, foundUser) => {
            if (err || !foundUser) {
                //log error here
                resolve({ success: false, message: 'user not found', status: 404 });
            } else {
                let dataToSave = {
                    user: foundUser._id,
                    public_id: foundUser.public_id,
                    jurisdiction_id: jurisdictionData.jurisdiction_id,
                    enrolment_number: jurisdictionData.enrolment_number,
                    year: jurisdictionData.year
                };

                if (file) {
                    //save to cloudinary first
                    var cloudResult = await uploadToCloud(file.path, "lawyercerts");
                    console.log("CLOUDINARY DETAILS FOR JURISDICTION", cloudResult);
                    if (cloudResult) {
                        dataToSave.certificate = [{
                            certificate_url: cloudResult.url,
                            certificate_secure_url: cloudResult.secure_url,
                            certificate_id: cloudResult.asset_id,
                            certificate_delete_token: cloudResult.delete_token,
                            certificate_resource_type: cloudResult.resource_type,
                            certificate_public_id: cloudResult.public_id,
                            certificate_name: file.originalname,
                            certificate_mime_type: file.mimetype
                        }];
                        //why delete?
                        delete dataToSave.enrolment_number;
                    }

                }

                JurisdictionModel.create(dataToSave).then(result => {
                    resolve({ success: true, message: 'jurisdiction added', status: 201, data: result });
                }).catch(error => {
                    //log error here
                    console.log(error);
                    reject({ success: false, message: 'could not add jurisdiction', status: 500 });
                });
            }

        });
    });
};

//Paginate later

const getlawyerJurisdiction = (publicId) => {
    return new Promise((resolve, reject) => {
        JurisdictionModel.find({ public_id: publicId }).populate("jurisdiction_id").select({ __v: 0, createdAt: 0, updatedAt: 0 }).exec((err, foundData) => {
            if (err) {
                resolve({ success: false, message: 'jurisdiction found', status: 404, data: null });
            } else {
                foundData = foundData.map(x => {
                    x = x.toObject();
                    x.jurisdiction_details = x.jurisdiction_id;
                    delete x.jurisdiction_id;
                    return x;
                });
                resolve({ success: true, message: 'jurisdiction retrieved', status: 200, data: foundData });
            }
        });
    });
};

const updateLawyerJurisdiction = (publicId, jurisdictionId, patchUpdateData = []) => {
    return new Promise((resolve, reject) => {
        console.log(publicId, jurisdictionId);
        JurisdictionModel.findOne({ public_id: publicId, _id: jurisdictionId }).exec((err, foundJurisdiction) => {
            if (err || !foundJurisdiction) {
                resolve({ success: false, message: 'jurisdiction not found', status: 404 });
            } else {
                let appliedPatch = applyPatch(foundJurisdiction.toObject(), patchUpdateData);
                JurisdictionModel.findOneAndUpdate({ _id: jurisdictionId, public_id: publicId }, appliedPatch.newDocument, { new: true }).exec((err, updatedData) => {
                    if (err || !updatedData) {
                        resolve({ success: false, message: 'could not update jurisdiction', status: 400, data: null });
                    }
                    resolve({ success: true, message: 'jurisdiction updated', status: 200, data: updatedData });
                });
            }
        });
    });
};

const deleteJurisdictionFile = (publicId, jurisdictionId, certificate_id, certificate_public_id) => {
    //make a call to cloudinary and delete file first
    return new Promise(async (resolve, reject) => {

        JurisdictionModel.findOneAndUpdate({ public_id: publicId, _id: jurisdictionId },
            { $pull: { "certificate": { _id: certificate_id } } },
            { upsert: false, new: true }).exec(async (err, updated) => {
                if (err) {
                    //Logger.error(err)
                    reject({ message: err, statusCode: 500, data: null });
                }

                resolve({ success: true, message: 'Jurisdiction file removed', status: 200, data: null });
                var response = await deleteFromCloud(certificate_public_id);
                if (response) {
                    console.log("-----------------------------DONE");
                }
            });
    });
};

const deleteJurisdiction = (publicId, jurisdiction_id) => {
    console.log("INCOMING DETAILS", publicId, jurisdiction_id)
    //make a call to cloudinary and delete file first
    return new Promise(async (resolve, reject) => {

        JurisdictionModel.findOne({public_id: publicId, jurisdiction_id: jurisdiction_id }).exec((err, foundData) => {
            if (err || !foundData) {
                console.log("adfasda", err)
                resolve({ success: false, message: 'jurisdiction not found', status: 404, data: null });
            } else {
                //foundData = foundData.toObject();

                JurisdictionModel.deleteOne({ public_id: publicId, jurisdiction_id: jurisdiction_id }).exec(async (err, deleted) => {
                    if (err || !deleted) {
                        //Logger.error(err)
                        reject({ message: "Something went wrong, either a server error or you and sending an empty field", statusCode: 500, data: null });
                    }
        
                    console.log("DELETED", deleted)
                    resolve({ success: true, message: 'Jurisdiction deleted', status: 200, data: null });
        
                    if(foundData.certificate.length>0){
                        for (index = 0; index < foundData.certificate.length; index++) { 
                            console.log("CERTIFICATE PUBLIC ID TO DELETE FROM CLOUDI...",jurisdiction_details.certificate_ids[index].certificate_public_id)
                            await deleteFromCloud(jurisdiction_details.certificate_ids[index].certificate_public_id);
                        }
                    }
                    
                });
            }
        });
    });
};


const addJurisdictionFile = async (public_id, jurisdiction_id, file) => {
    return new Promise((resolve, reject) => {
        JurisdictionModel.findOne({ _id: jurisdiction_id, public_id: public_id }).exec(async (err, foundResult) => {
            if (err || !foundResult) {
                resolve({ success: false, data: null, message: 'jurisdiction not found', status: 404 });
            } else {
                var certificate = {};
                if (file) {
                    //save to cloudinary first
                    console.log("FILE---------------------------------------------->", file)
                    var cloudResult = await uploadToCloud(file.path, "lawyercerts");
                    //console.log("uploaded", cloudResult);
                    if (cloudResult) {
                        certificate = {
                            certificate_url: cloudResult.url,
                            certificate_secure_url: cloudResult.secure_url,
                            certificate_id: cloudResult.asset_id,
                            certificate_delete_token: cloudResult.delete_token,
                            certificate_resource_type: cloudResult.resource_type,
                            certificate_public_id: cloudResult.public_id,
                            certificate_name: file.originalname,
                            certificate_mime_type: file.mimetype
                        };
                    }
                }

                JurisdictionModel.findOneAndUpdate({ public_id: public_id, _id: jurisdiction_id }, { $push: { "certificate": certificate } }, { upsert: true, new: true }, (err, updated) => {
                    if (err) {
                        //Logger.error(err)
                        reject({ success: false, message: "something went wrong while uploading your certificate", status: 500, data: null });
                    } else {
                        resolve({ success: true, message: "Certificate added successfully", status: 201, data: updated });
                    }
                });

            }
        });
    });
};

const getSinglelawyerJurisdiction = (publicId, areaId) => {
    return new Promise((resolve, reject) => {
        JurisdictionModel.findOne({ public_id: publicId, _id: areaId }).populate("jurisdiction_id").select({ __v: 0, createdAt: 0, updatedAt: 0 }).exec((err, foundData) => {
            if (err) {
                console.log("adfasda", err)
                resolve({ success: false, message: 'jurisdiction found', status: 404, data: null });
            } else {
                foundData = foundData.toObject();
                foundData.jurisdiction_details = foundData.jurisdiction_id;
                delete foundData.jurisdiction_id;
                resolve({ success: true, message: 'jurisdiction retrieved', status: 200, data: foundData });
            }
        });
    });
};


module.exports = {
    addlawyerJurisdiction, getlawyerJurisdiction, updateLawyerJurisdiction, deleteJurisdictionFile, addJurisdictionFile, getSinglelawyerJurisdiction, deleteJurisdiction
};