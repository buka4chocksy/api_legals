const experience = require('../../models/lawyer/experience');
const { applyPatch, validate } = require('fast-json-patch');

exports.createExperience = (data) => {
    return new Promise((resolve, reject) => {
        experience.create(data).then((updated) => {
            if (updated) {
                resolve({ success: true, message: 'Experience created', status: 200, data: null });
            }
        }).catch(error => {
            console.log(error);
            reject({ success: false, message: error, status: 500 });
        });
    });
};

exports.updateExperience = (data, patchUpdateData) => {
    return new Promise((resolve, reject) => {
        experience.findOne({ public_id: data.public_id }).exec((err, foundExperience) => {
            if (err || !foundExperience) {
                resolve({ success: false, message: 'Experience not found', status: 404 });
            }

            let validationError = validate(patchUpdateData);
            if (validationError) {
                resolve({ success: false, message: 'invalid operation', status: 400 });
            }

            let appliedPatch = applyPatch(foundExperience.toObject(), patchUpdateData);

            experience.findOneAndUpdate({ public_id: data.public_id }, appliedPatch.newDocument, { new: true }).exec((err, updatedData) => {
                if (err || !updatedData) {
                    resolve({ success: false, message: 'could not update Experience', status: 404, data: null });
                }
                resolve({ success: true, message: 'Experience updated', status: 200, data: updatedData });
            });
        });
    });
};

exports.retrieveExperience = (data) => {
    return new Promise((resolve, reject) => {
        experience.find({ public_id: data.public_id }).exec((err, result) => {
            if (err) reject({ success: false, err: err, status: 500 });
            resolve({ success: true, message: 'Experience retrieved', status: 200, data: result });
        });
    });
};

exports.deleteExperience = (data) => {
    return new Promise((resolve, reject) => {
        experience.findOneAndDelete({ public_id: data.public_id }).exec((err, deleted) => {
            if (err) reject({ success: false, err: err, status: 500 });

            resolve({ success: true, message: 'Experience deleted', data: null, status: 200 });
        });
    });
};