const PracticeAreaModel = require('../../models/lawyer/lawyerPracticeArea');
const UserModel = require('../../models/auth/users');
const { applyOperation, validate } = require('fast-json-patch');

const addLawyerPracticeArea = (publicId, practiceAreaData = "") => {
  return  UserModel.findOne({ public_id: publicId }).exec((err, foundUser) => {
        if (err || !foundUser) {
            //log error here
            return Promise.resolve({ success: false, message: 'user not found', status: 404 });
        }
        let practiceAreaArrayToCreate = practiceAreaData.split(",").map(singlepracticeArea => {
            return {
                user: foundUser._id,
                public_id: foundUser.public_id,
                practice_area_id: singlepracticeArea
            };
        });
        return PracticeAreaModel.create(practiceAreaArrayToCreate).then(result => {
            return { success: true, message: 'practice area added', status: 201, data : result };
        }).catch(error => {
            console.log("check error", error);
            return { success: false, message: 'could not add practice area', status: 500 };
        });

    });
};

const getUserPracticeArea = (publicId) => {
    return  PracticeAreaModel.findOne({public_id : publicId}).exec((err, foundData) => {
        if(err){
            return Promise.resolve({ success: false, message: 'practice area not found', status: 404 });
        }
        return Promise.resolve({ success: false, message: 'practice area retrieved', status: 200, data : foundData });
    })
};

const updateUserPracticeArea = (publicId,practiceAreaId,  patchUpdateData) => {
  return  PracticeAreaModel.findOne({_id : practiceAreaId, public_id : publicId}).exec((err, foundArea) =>{
        if(err || !foundArea){
            return Promise.resolve({ success: false, message: 'practice area not found', status: 404 });
        }
        let validationError = validate(patchUpdateData);
        if(validationError){
            return Promise.resolve({ success: false, message: 'invalid operation', status: 400 });
        }
        let appliedPatch = applyOperation(foundArea, patchUpdateData);
        PracticeAreaModel.findOneAndUpdate({_id : practiceAreaId, public_id : publicId}, appliedPatch.newDocument, {new : true}).exec((err, updatedData) => {
            if(err || !updatedData){
                return Promise.resolve({ success: false, message: 'could not update practice area', status: 404, data : null });
            }
            return Promise.resolve({success : true, message : 'practice area updated', status : 200, data : updatedData });
        })
    })
};

const deleteUserPracticeArea = (publicId, practiceAreaId) => {
  return  PracticeAreaModel.findOneAndDelete({_id : practiceAreaId, public_id : publicId}).exec((err, deletedData) => {
        if(err){
            return Promise.resolve({ success: false, message: 'could not delete practice area', status: 404, data : null });
        }
        return Promise.resolve({ success: false, message: 'practice area deleted', status: 200, data : null });
    })
};


const getSingleUserPracticeArea = (publicId, practiceAreaId) => {
    return  PracticeAreaModel.findOne({_id : practiceAreaId, public_id : publicId}).exec((err, foundData) => {
        if(err){
            return Promise.resolve({ success: false, message: 'practice area not found', status: 404 });
        }
        return Promise.resolve({ success: false, message: 'practice area retrieved', status: 200, data : foundData });
    })
};

module.exports = {
    addLawyerPracticeArea, getUserPracticeArea, updateUserPracticeArea, deleteUserPracticeArea, getSingleUserPracticeArea
}