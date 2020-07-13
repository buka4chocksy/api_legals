const education = require('../../models/lawyer/education');
const { applyOperation, applyPatch } = require('fast-json-patch');

exports.createEducation = (publicId, data) => {
    return new Promise((resolve, reject) => {
        let dataToSave = {
            school : data.school,
            public_id: publicId,
            start_year :data.from,
            end_year : data.to,
            organization : data.company,
            awards : data.awards
        }
        education.create(dataToSave).then((created) => {
            if (created) {
                resolve({ success: true, message: 'Education created', status: 201, data: created });
            }
        }).catch(error => {
            reject({ success: false, message: error, status: 500 });
        });
    });
};

exports.updateEducation = (publicId, educationId, patchUpdateData = []) => {
    return new Promise((resolve, reject) => {
        education.findOne({ public_id: publicId, _id : educationId }).exec((err, foundEducation) => {
            if (err || !foundEducation) {
                resolve({ success: false, message: 'Education not found', status: 404 });
            }else{
            patchUpdateData = patchUpdateData.map(x=> {
                    if(x.hasOwnProperty('to')){
                        x.start_year = x["to"];
                        delete x["to"];
                    }
                    if(x.hasOwnProperty('from')){
                        x.start_year = x["from"];
                        delete x["from"]
                    }

                    return x;
                })
                console.log("patch data", patchUpdateData);
                let appliedPatch = applyPatch(foundEducation.toObject(), patchUpdateData);
            education.findOneAndUpdate({ public_id: publicId }, appliedPatch.newDocument, { new: true }).exec((err, updatedData) => {
                if (err || !updatedData) {
                    resolve({ success: false, message: 'could not update Education', status: 404, data: updatedData });
                }
                resolve({ success: true, message: 'Education updated', status: 200, data: updatedData });
            });
        }
        });
    });
};

exports.retrieveEducation = (publicId, paginationParam) => {
    return new Promise((resolve, reject) => {
        education.find({ public_id: publicId }).select({createdAt : 0, updatedAt : 0, __v : 0}).exec((err, result) => {
            if (err) reject({ success: false, err: err, status: 500 });
            resolve({ success: true, message: 'Education retrieved', status: 200, data: result });
        });
    });
};

exports.retrieveSingleUserEduction = (publicId, eductionId) => {
    return new Promise((resolve, reject) => {
        education.findOne({ public_id: publicId, _id : eductionId }).select({createdAt : 0, updatedAt : 0, __v : 0}).exec((err, result) => {
            if (err) reject({ success: false, err: err, status: 500 });
            resolve({ success: true, message: 'Education retrieved', status: 200, data: result });
        });
    });
}

exports.deleteEducation = (public_id, educationId) => {
    return new Promise((resolve, reject) => {
        education.findOneAndDelete({ public_id: public_id, _id : educationId }).exec((err, deleted) => {
            if (err) reject({ success: false, err: err, status: 500 });

            resolve({ success: true, message: 'Education deleted', data: null, status: 200 });
        });
    });
};