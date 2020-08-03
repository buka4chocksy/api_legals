const PracticeAreaModel = require('../../models/lawyer/lawyerPracticeArea');
const UserModel = require('../../models/auth/users');
const { applyPatch, validate } = require('fast-json-patch');

const addLawyerPracticeArea = (publicId, practiceAreaData) => {
    console.log(publicId, "===================")
    return new Promise ((resolve, reject)=>{
        UserModel.findOne({ public_id: publicId }).exec((err, foundUser) => {
            console.log("I got here ooo", foundUser)
            if (err || !foundUser) {
                //log error here
                resolve({ success: false, message: 'user not found', status: 404 });
            }

            let practiceAreaArrayToCreate = practiceAreaData.split(",").map(singlepracticeArea => {    
                console.log("I got here2")
                return {
                    user: foundUser._id,
                    public_id: foundUser.public_id,
                    practice_area: singlepracticeArea
                };
            });

            console.log("I got here1", practiceAreaArrayToCreate)

            PracticeAreaModel.create(practiceAreaArrayToCreate).then(result => {
                console.log("I got here")
                delete result.user
                resolve({ success: true, message: 'practice area added', status: 201, data : result });
            }).catch(error => {
                console.log("check error", error);
                reject({ success: false, message: 'could not add practice area', status: 500 });
            });
        });
    })
};

const getUserPracticeArea = (publicId) => {
    return new Promise((resolve, reject)=>{
        PracticeAreaModel.find({public_id : publicId}).populate('practice_area').select({ __v: 0, createdAt: 0, updatedAt: 0 }).exec((err, foundData) => {
            if(err){
                resolve({ success: false, message: 'practice area not found', status: 404 });
            }
            delete foundData.user
            resolve({ success: true, message: 'practice area retrieved', status: 200, data : foundData });
        })
    })  
};

//UPDATING THE PRACTICE AREA IS NOT needed
const updateUserPracticeArea = (publicId, practiceAreaId, patchUpdateData) => {
    console.log("DATA",publicId, practiceAreaId, patchUpdateData)

  return new Promise((resolve, reject)=>{
    PracticeAreaModel.findOne({practice_area : practiceAreaId, public_id : publicId}).exec((err, foundArea) =>{
        if(err || !foundArea){
            resolve({ success: false, message: 'practice area not found', status: 404 });
        }
        console.log("the found area",foundArea)
        let validationError = validate(patchUpdateData);
        if(validationError){
            resolve({ success: false, message: 'invalid operation', status: 400 });
        }
        let appliedPatch = applyPatch(foundArea, patchUpdateData);
        PracticeAreaModel.findOneAndUpdate({_id : practiceAreaId, public_id : publicId}, appliedPatch.newDocument, {new : true}).exec((err, updatedData) => {
            if(err || !updatedData){
                console.log(err, updatedData)
                resolve({ success: false, message: 'could not update practice area', status: 404, data : null });
            }
            resolve({success : true, message : 'practice area updated', status : 200, data : updatedData });
        })
    })
  }) 
};

const deleteUserPracticeArea = (publicId, practiceAreaId) => {
  return new Promise((resolve, reject)=>{
    PracticeAreaModel.findOneAndDelete({practice_area : practiceAreaId, public_id : publicId}).exec((err, deletedData) => {
        if(err){
            resolve({ success: false, message: 'could not delete practice area', status: 404, data : null });
        }
        resolve({ success: true, message: 'practice area deleted', status: 200, data : null });
    })
  })
};


const getSingleUserPracticeArea = (publicId, practiceAreaId) => {
    return new Promise((resolve,reject)=>{
        PracticeAreaModel.findOne({practice_area : practiceAreaId, public_id : publicId}).exec((err, foundData) => {
            if(err){
                resolve({ success: false, message: 'practice area not found', status: 404 });
            }
            resolve({ success: true, message: 'practice area retrieved', status: 200, data : foundData });
        })
    })  
};

module.exports = {
    addLawyerPracticeArea, getUserPracticeArea, updateUserPracticeArea, deleteUserPracticeArea, getSingleUserPracticeArea
}