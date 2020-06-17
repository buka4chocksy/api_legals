const model = require('../models/lawyer/jurisdiction');

//create jurisdiction
exports.create = (data) => {
    return new Promise((resolve, reject) => {
        model.findOne({ name: data.name }).then(exists => {
            if (exists) {
                resolve({ success: false, message: 'jurisdiction already exists !!!', status:400})
            } else {
                const detail = { name: data.name }
                model.create(detail).then(created => {
                    if (created) {
                        resolve({ success: true, message: 'jurisdiction created successfully', status:200 })
                    } else {
                        resolve({ success: false, message: 'could not create jurisdiction', status:400 })
                    }
                }).catch(err => reject({err: err , status:500}))
            }
        }).catch(err => reject({err: err , status:500}));
    })
}

//update jurisdiction
exports.update = (id, new_name) => {
    return new Promise((resolve, reject) => {
        model.findByIdAndUpdate({ _id: id }, { name: new_name }).then(updated => {
            if (updated) {
                resolve({ success: true, message: 'jurisdiction updated successfully' , status:200 })
            } else {
                resolve({ success: false, message: 'Error encountered while updating jurisdiction !!!', status:400 })
            }
        }).catch(err => reject({err: err , status:500}))
    })
}

//get all jurisdiction
exports.getAll = () => {
    return new Promise((resolve, reject) => {
        model.find({}).then(data => {
            if (data) {
                resolve({ success: true, message: 'jurisdiction', data: data , status:200 })
            } else {
                resolve({ success: false, message: 'no jurisdiction found !!!' ,status:404})
            }
        }).catch(err => reject({err: err , status:500}));
    })
}

//get single jurisdiction
exports.getById = (data) => {
    return new Promise((resolve, reject) => {
        model.findOne({ _id: data }).then(found => {
            if (found) {
                resolve({ success: true, message: found , status:200 })
            } else {
                resolve({ success: false, message: 'could not find jurisdiction !!' ,status:404})
            }
        }).catch(err => reject({err: err , status:500}));
    })
}

//delete jurisdiction
exports.delete = (data) => {
    return new Promise((resolve, reject) => {
        model.findOneAndRemove({ _id: data }).then(found => {
            if (found) {
                resolve({ success: true, message: 'jurisdiction deleted',status:200 })
            } else {
                resolve({ success: false, message: 'could not delete jurisdiction !!', status:400 })
            }
        }).catch(err => reject({err: err , status:500}));
    })
}
