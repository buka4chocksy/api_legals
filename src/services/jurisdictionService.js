const model = require('../models/jurisdiction');

//create jurisdiction
exports.create = (data) => {
    return new Promise((resolve, reject) => {
        model.findOne({ name: data.name }).then(exists => {
            if (exists) {
                resolve({ success: false, message: 'jurisdiction already exists !!!' })
            } else {
                const detail = { name: data.name }
                model.create(detail).then(created => {
                    if (created) {
                        resolve({ success: true, message: 'jurisdiction created successfully' })
                    } else {
                        resolve({ success: false, message: 'could not create jurisdiction' })
                    }
                }).catch(err => reject(err))
            }
        }).catch(err => reject(err));
    })
}

//update jurisdiction
exports.update = (id, new_name) => {
    return new Promise((resolve, reject) => {
        model.findByIdAndUpdate({ _id: id }, { name: new_name }).then(updated => {
            if (updated) {
                resolve({ success: true, message: 'jurisdiction updated successfully' })
            } else {
                resolve({ success: false, message: 'Error encountered while updating jurisdiction !!!' })
            }
        }).catch(err => reject(err))
    })
}

//get all jurisdiction
exports.getAll = () => {
    return new Promise((resolve, reject) => {
        model.find({}).then(data => {
            if (data) {
                resolve({ success: true, message: 'jurisdiction', data: data })
            } else {
                resolve({ success: false, message: 'no jurisdiction found !!!' })
            }
        }).catch(err => reject(err));
    })
}

//get single jurisdiction
exports.getById = (data) => {
    return new Promise((resolve, reject) => {
        model.findOne({ _id: data }).then(found => {
            if (found) {
                resolve({ success: true, message: found })
            } else {
                resolve({ success: false, message: 'could not find jurisdiction !!' })
            }
        }).catch(err => reject(err));
    })
}

//delete jurisdiction
exports.delete = (data) => {
    return new Promise((resolve, reject) => {
        model.findOneAndRemove({ _id: data }).then(found => {
            if (found) {
                resolve({ success: true, message: 'jurisdiction deleted' })
            } else {
                resolve({ success: false, message: 'could not delete jurisdiction !!' })
            }
        }).catch(err => reject(err));
    })
}
