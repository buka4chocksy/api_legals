const model = require('../models/practicearea/practiceArea');

//create practicearea
const createPracticeArea = (data) => {
    return new Promise((resolve, reject) => {
        model.findOne({ name: data.name }).then(exists => {
            if (exists) {
                resolve({ success: false, message: 'pracitce area already exists', status:409 })
            } else {
                const detail = { name: data.name }
                model.create(detail).then(created => {
                    if (created) {
                        resolve({ success: true, message: 'practice area created successfully' ,status:201})
                    } else {
                        resolve({ success: false, message: 'could not create practic earea' , status:400 })
                    }
                }).catch(err => reject({err: err , status:500}))
            }
        }).catch(err => reject({err: err , status:500}));
    })
}

//update practicearea
const updatePracticeArea = (id, new_name) => {
    return new Promise((resolve, reject) => {
        model.findByIdAndUpdate({ _id: id }, { name: new_name }).then(updated => {
            if (updated) {
                resolve({ success: true, message: 'practic earea updated successfully',status:200 })
            } else {
                resolve({ success: false, message: 'Error encountered while updating practice area', status:400 })
            }
        }).catch(err => reject({err: err , status:500}))
    })
}

//get all practicearea
const getAllPracticeArea = () => {
    return new Promise((resolve, reject) => {
        model.find({}).then(data => {
            if (data) {
                resolve({ success: true, message: 'practice areas retrieved', data: data , status:200 })
            } else {
                resolve({ success: false, message: 'no practice area found' ,status:404})
            }
        }).catch(err => reject({err: err , status:500}));
    })
}

//get single practicearea
const getPracticeAreaById = (id) => {
    return new Promise((resolve, reject) => {
        model.findOne({ _id: id }).then(found => {
            if (found) {
                resolve({ success: true, data: found, message : "not found" , status:200})
            } else {
                resolve({ success: false, message: 'could not find practice area' , status:404})
            }
        }).catch(err => reject({err: err , status:500}));
    })
}

//delete practicearea
const deletePracticeArea = (id) => {
    return new Promise((resolve, reject) => {
        model.findOneAndRemove({ _id: id }).then(found => {
            if (found) {
                resolve({ success: true, message: 'practice area deleted', status:200 })
            } else {
                resolve({ success: false, message: 'could not delete practice area' , status:400})
            }
        }).catch(err => reject({err: err , status:500}));
    })
}

module.exports = {
    createPracticeArea, updatePracticeArea, getAllPracticeArea, getPracticeAreaById, deletePracticeArea
}
