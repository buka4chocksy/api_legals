const JurisdictionModel = require('../../models/lawyer/lawyerJurisdiction');
const Jurisdiction = require('../../models/lawyer/jurisdiction')
const UserModel = require('../../models/auth/users');
const { applyPatch } = require('fast-json-patch');
const { uploadToCloud, deleteFromCloud } = require('../../utils/cloudinaryUtil');
const jurisdiction = require('../../models/lawyer/jurisdiction');


//fix this to check if the jurisdiction am adding already exist
const addlawyerJurisdiction = (public_id, jurisdictionData, file) => {
    return new Promise((resolve, reject) => {
        UserModel.findOne({ public_id: public_id }).exec(async (err, foundUser) => {
            if (err || !foundUser) {
                //log error here
                resolve({ success: false, message: 'user not found', status: 404 });
            } else {

                console.log("check", foundUser);
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

                    if (cloudResult) {
                        dataToSave.certificate = [{
                            certificate_url: cloudResult.url,
                            certificate_secure_url: cloudResult.secure_url,
                            certificate_id: cloudResult.asset_id,
                            certificate_delete_token: cloudResult.delete_token,
                            certificate_resource_type: cloudResult.resource_type,
                            certificate_public_id: cloudResult.public_id
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
        JurisdictionModel.populate("jurisdiction_id").find({ public_id: publicId }).select({ __v: 0, createdAt: 0, updatedAt: 0 })
        
        .exec((err, foundData) => {
            if (err) {
                resolve({ success: false, message: 'jurisdiction found', status: 404, data: null });
            }
            resolve({ success: true, message: 'jurisdiction retrieved', status: 200, data: foundData });
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

const addJurisdictionFile = async (public_id, jurisdiction_id, file) => {
    return new Promise((resolve, reject) => {
        JurisdictionModel.findOne({ _id: jurisdiction_id, public_id: public_id }).exec(async (err, foundResult) => {
            if (err || !foundResult) {
                resolve({ success: false, data: null, message: 'jurisdiction not found', status: 404 });
            } else {
                var certificate = {};
                if (file) {
                    //save to cloudinary first
                    var cloudResult = await uploadToCloud(file.path, "lawyercerts");
                    console.log("uploaded", cloudResult);
                    if (cloudResult) {
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
        JurisdictionModel.find({ public_id: publicId, _id: areaId }).select({ __v: 0, createdAt: 0, updatedAt: 0 }).exec((err, foundData) => {
            if (err) {
                resolve({ success: false, message: 'jurisdiction found', status: 404, data: null });
            }
            resolve({ success: true, message: 'jurisdiction retrieved', status: 200, data: foundData });
        });
    });
};


module.exports = {
    addlawyerJurisdiction, getlawyerJurisdiction, updateLawyerJurisdiction, deleteJurisdictionFile, addJurisdictionFile, getSinglelawyerJurisdiction
};