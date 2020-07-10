const bio = require('../../models/lawyer/bio');
const { applyOperation, validate } = require('fast-json-patch');

exports.createBio = (data) => {
    return new Promise((resolve, reject) => {
        console.log("DATA", data)
        bio.create(data).then((updated) => {
            if (updated) {
                resolve({ success: true, message: 'Bio created', status:200, data: null })
            }
        }).catch(error => {
            //log error here
            console.log(error)
            reject ({ success: false, message: error, status: 500 });
        })
    })
}

exports.updateBio = (data, patchUpdateData) => {
    console.log(data)
    return new Promise((resolve, reject) => {
        bio.findOne({public_id : data.public_id}).exec((err, foundBio) =>{
            if(err || !foundBio){
                resolve({ success: false, message: 'bio not found', status: 404 });
            }

            console.log(foundBio)
            // let validationError = validate(patchUpdateData);
            // if(validationError){
            //     console.log(validationError)
            //     resolve({ success: false, message: 'invalid operation', status: 400 });
            // }

            let appliedPatch = applyOperation(foundBio.toObject(), patchUpdateData);

            bio.findOneAndUpdate({public_id : data.public_id}, appliedPatch.newDocument, {new : true }).exec((err, updatedData) => {
                if(err || !updatedData){
                    resolve({ success: false, message: 'could not update bio', status: 404, data : null });
                }
                resolve({success : true, message : 'bio updated', status : 200, data : updatedData });
            })
        })
    })
}

exports.retrieveBio = (data) => {
    return new Promise((resolve, reject) => {
        bio.findOne({ public_id: data.public_id }).exec((err, result) => {
            if (err) reject({success: false, err: err, status:500});

            if (result) {
                resolve({ success: true, message: 'Bio retrieved' , status: 200, data: result })
            }else{
                resolve({ success: false, message: 'No bio available' , status: 200, data: null })
            }
        })
    })
}

exports.deleteBio = (data)=>{
    return new Promise((resolve ,reject)=>{
        bio.findOneAndDelete({public_id: data.public_id}).exec((err , deleted)=>{
            if(err)reject({success: false, err: err, status:500});

            resolve({success:true , message:'Bio deleted', data:null , status:200})
        })
    })
}