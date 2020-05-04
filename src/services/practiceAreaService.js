const model = require('../models/practiceArea');

//create practicearea
exports.create = (data) => {
    return new Promise((resolve, reject) => {
        model.findOne({ name: data.name }).then(exists => {
            if (exists) {
                resolve({ success: false, message: 'pracitcearea already exists !!!', status:400 })
            } else {
                const detail = { name: data.name }
                model.create(detail).then(created => {
                    if (created) {
                        resolve({ success: true, message: 'practicearea created successfully' ,status:200})
                    } else {
                        resolve({ success: false, message: 'could not create practicearea' , status:400 })
                    }
                }).catch(err => reject({err: err , status:500}))
            }
        }).catch(err => reject({err: err , status:500}));
    })
}

//update practicearea
exports.update = (id, new_name) => {
    return new Promise((resolve, reject) => {
        model.findByIdAndUpdate({ _id: id }, { name: new_name }).then(updated => {
            if (updated) {
                resolve({ success: true, message: 'practicearea updated successfully',status:200 })
            } else {
                resolve({ success: false, message: 'Error encountered while updating practice area !!!', status:400 })
            }
        }).catch(err => reject({err: err , status:500}))
    })
}

//get all practicearea
exports.getAll = () => {
    return new Promise((resolve, reject) => {
        model.find({}).then(data => {
            if (data) {
                resolve({ success: true, message: 'practiceareas', data: data , status:200 })
            } else {
                resolve({ success: false, message: 'no practicearea found !!!' ,status:404})
            }
        }).catch(err => reject({err: err , status:500}));
    })
}

//get single practicearea
exports.getById = (data) => {
    return new Promise((resolve, reject) => {
        model.findOne({ _id: data }).then(found => {
            if (found) {
                resolve({ success: true, message: found , status:200})
            } else {
                resolve({ success: false, message: 'could not find practicearea !!' , status:404})
            }
        }).catch(err => reject({err: err , status:500}));
    })
}

//delete practicearea
exports.delete = (data) => {
    return new Promise((resolve, reject) => {
        model.findOneAndRemove({ _id: data }).then(found => {
            if (found) {
                resolve({ success: true, message: 'practicearea deleted', status:200 })
            } else {
                resolve({ success: false, message: 'could not delete practicearea !!' , status:400})
            }
        }).catch(err => reject({err: err , status:500}));
    })
}
