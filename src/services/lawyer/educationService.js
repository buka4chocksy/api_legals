const education = require('../../models/lawyer/education');
const { applyOperation } = require('fast-json-patch');

exports.createEducation = (publicId, data) => {
    return new Promise((resolve, reject) => {
        let dataToSave = {
            public_id: publicId,
            start_year :data.from,
            end_year : data.to,
            organization : data.company,
            awards : data.awards.split(",").map(x => ({name : x}))
        }
        education.create(dataToSave).then((updated) => {
            if (updated) {
                resolve({ success: true, message: 'Education created', status: 201, data: null });
            }
        }).catch(error => {
            reject({ success: false, message: error, status: 500 });
        });
    });
};

exports.updateEducation = (publicId, educationId, patchUpdateData) => {
    return new Promise((resolve, reject) => {
        education.findOne({ public_id: publicId, _id : educationId }).exec((err, foundEducation) => {
            if (err || !foundEducation) {
                resolve({ success: false, message: 'Education not found', status: 404 });
            }

            let appliedPatch = applyOperation(foundEducation.toObject(), patchUpdateData);
            education.findOneAndUpdate({ public_id: data.public_id }, appliedPatch.newDocument, { new: true }).exec((err, updatedData) => {
                if (err || !updatedData) {
                    resolve({ success: false, message: 'could not update Education', status: 404, data: null });
                }
                resolve({ success: true, message: 'Education updated', status: 200, data: updatedData });
            });
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