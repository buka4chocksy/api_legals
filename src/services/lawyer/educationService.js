const education = require('../../models/lawyer/education');
const { applyOperation, validate } = require('fast-json-patch');

exports.createEducation = (data) => {
    return new Promise((resolve, reject) => {
        console.log("DATA", data)
        education.create(data).then((updated) => {
            if (updated) {
                resolve({ success: true, message: 'Education created', status:200, data: null })
            }
        }).catch(error => {
            //log error here
            console.log(error)
            reject ({ success: false, message: error, status: 500 });
        })
    })
}

exports.updateEducation = (data, patchUpdateData) => {
    console.log(data)
    return new Promise((resolve, reject) => {
        education.findOne({public_id : data.public_id}).exec((err, foundEducation) =>{
            if(err || !foundEducation){
                resolve({ success: false, message: 'Education not found', status: 404 });
            }

            console.log(foundEducation)
            // let validationError = validate(patchUpdateData);
            // if(validationError){
            //     console.log(validationError)
            //     resolve({ success: false, message: 'invalid operation', status: 400 });
            // }

            let appliedPatch = applyOperation(foundEducation.toObject(), patchUpdateData);

            education.findOneAndUpdate({public_id : data.public_id}, appliedPatch.newDocument, {new : true }).exec((err, updatedData) => {
                if(err || !updatedData){
                    resolve({ success: false, message: 'could not update Education', status: 404, data : null });
                }
                resolve({success : true, message : 'Education updated', status : 200, data : updatedData });
            })
        })
    })
}

exports.retrieveEducation = (data) => {
    return new Promise((resolve, reject) => {
        education.findOne({ public_id: data.public_id }).exec((err, result) => {
            if (err) reject({success: false, err: err, status:500});

            if (result) {
                resolve({ success: true, message: 'Education retrieved' , status: 200, data: result })
            }else{
                resolve({ success: false, message: 'No education available' , status: 200, data: null })
            }
        })
    })
}

exports.deleteEducation = (data)=>{
    return new Promise((resolve ,reject)=>{
        education.findOneAndDelete({public_id: data.public_id}).exec((err , deleted)=>{
            if(err)reject({success: false, err: err, status:500});

            resolve({success:true , message:'Education deleted', data:null , status:200})
        })
    })
}