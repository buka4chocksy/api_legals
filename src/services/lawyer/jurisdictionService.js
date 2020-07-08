const JurisdictionModel = require('../../models/lawyer/lawyerJurisdiction');
const UserModel = require('../../models/auth/users');
const { applyOperation, validate } = require('fast-json-patch');
const {uploadToCloud} = require('../../utils/cloudinaryUtil');

//fix this to check if the jurisdiction am adding already exist
const addlawyerJurisdiction =  (publicId, jurisdictionData = {}, file) => {
    return  UserModel.findOne({ public_id: publicId }).exec( async (err, foundUser) => {
        if (err || !foundUser) {
            //log error here
            return Promise.resolve({ success: false, message: 'user not found', status: 404 });
        }
        let dataToSave =  {
                 user: foundUser._id,
                 public_id: foundUser.public_id,
                 jurisdiction_id: jurisdictionData.id,
                 enrollment_number : jurisdictionData.enrollment_number
             };
        if(file){
            //save to cloudinary first
          var cloudResult =   await uploadToCloud(file.path, "lawyercerts");
            dataToSave.certicicate = [{
                certicicate_url: cloudResult.url, 
                certicicate_secure_url : cloudResult.secure_url,
                certicicate_id: cloudResult.asset_id,
                certicicate_delete_token : cloudResult.delete_token,
                certicicate_resource_type : cloudResult.resource_type,
                certificate_public_id: cloudResult.public_id
            }];
            delete dataToSave.enrollment_number;
        }

      return  JurisdictionModel.create(dataToSave).then(result => {
            return { success: true, message: 'jurisdiction added', status: 201, data : result };
        }).catch(error => {
            //log error here
            return { success: false, message: 'could not add jurisdiction', status: 500 };
        })

    });
}

const getalawyerJurisdiction = (publicId) => {
    return  JurisdictionModel.findOne({public_id : publicId}).exec((err, foundData) => {
        if(err){
            return Promise.resolve({ success: false, message: 'jurisdiction found', status: 404 });
        }
        return Promise.resolve({ success: false, message: 'jurisdiction retrieved', status: 200, data : foundData });
    })
};

const updateLawyerJurisdiction = (publicId,jurisdictionId, patchUpdateData) => {
    return  JurisdictionModel.findOne({_id : jurisdictionId, public_id : publicId}).exec((err, founJurisdiction) =>{
          if(err || !founJurisdiction){
              return Promise.resolve({ success: false, message: 'jurisdiction not found', status: 404 });
          }
          let validationError = validate(patchUpdateData);
          if(validationError){
              return Promise.resolve({ success: false, message: 'invalid operation', status: 400 });
          }
          let appliedPatch = applyOperation(founJurisdiction, patchUpdateData);
          JurisdictionModel.findOneAndUpdate({_id : jurisdictionId, public_id : publicId}, appliedPatch.newDocument, {new : true}).exec((err, updatedData) => {
              if(err || !updatedData){
                  return Promise.resolve({ success: false, message: 'could not add jurisdiction', status: 404, data : null });
              }
              return Promise.resolve({success : true, message : 'jurisdiction updated', status : 200, data : updatedData });
          })
      })
  };

  const DeleteJurisdictionFile = (pubicId, jurisdictionId,certicicate_id ) => {
    //make a call to cloudinary and delete file first
    JurisdictionModel.findOne({_id : jurisdictionId, public_id : publicId}).exec((err, founJurisdiction) =>{

    })
  }

  const AddJurisditionFile = () => {

  }

  module.exports = {
    addlawyerJurisdiction, getalawyerJurisdiction, updateLawyerJurisdiction, DeleteJurisdictionFile, AddJurisditionFile
  }