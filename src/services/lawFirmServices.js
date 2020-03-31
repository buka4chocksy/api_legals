const model = require('../models/lawFirm');

exports.createLawFirm = (id, data) => {
    return new Promise((resolve, reject) => {
        const details = {
            lawyer_id: id,
            name_of_firm: data.name_of_firm,
            contact_email: data.contact_email,
            contact_phone_number: [{
                phone_number: data.contact_phone_number
            }],
            practice_area: [{
                practice_area_id: data.practice_area
            }],
            practitioner: [{
                practitioner_name: data.practitioner,
                degree: data.degree
            }],
            country: [{
                country_name: data.country
            }],
            state: [{
                state_name: data.state
            }],
            address: [{
                address_name: data.address
            }]
        }
        model.findOne({ name_of_firm: details.name_of_firm, contact_email: details.contact_email }).exec((err, exists) => {
            if (err) reject(err)
            if (exists) {
                resolve({ success: false, message: 'lawfirm already exists !!!' })
            } else {
                model.create(details).then(created => {
                    if (created) {
                        resolve({ success: true, message: 'lawfirm created successfully' })
                    } else {
                        resolve({ success: false, message: 'error creating lawfirm' })
                    }
                }).catch(err => reject(err));
            }
        })
    })
}

//profile picture update
exports.uploadProfilePicture = (id, firmId, data) => {
    return new Promise((resolve, reject) => {
        const detail = {
            image_url: data.imageUrl,
            image_id: data.imageID
        }
        model.findOneAndUpdate({ lawyer_id: id, _id: firmId }, detail).exec((err, updated) => {
            if (err) reject(err);
            if (updated) {
                resolve({ success: true, message: 'profile picture updated ' })
            } else {
                resolve({ success: false, message: 'Error updating profile picture' })
            }
        })
    })
}

//get lawfirm profile
exports.getLawFirmProfile = (id, firmId) => {
    return new Promise((resolve, reject) => {
        model.findOne({ lawyer_id: id, _id: firmId }).populate({ path: 'practice_area.practice_area_id', model: 'practiceArea' })
            .exec((err, exists) => {
                if (err) reject(err);
                if (exists) {
                    resolve({ success: true, message: 'lawfirms', data: exists })
                } else {
                    resolve({ success: false, message: 'could not find lawfirm' })
                }
            })
    })
}

//get list of lawfirms
exports.lawFirmList = (pagenumber = 1, pagesize = 20) => {
    return new Promise((resolve, reject) => {
        model.find({}).skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
            .populate({ path: 'lawyer_id', model: 'users', select: { _id: 0, __v: 0 } })
            .populate({ path: "practice_area.practice_area_id", model: 'practiceArea', select: { _id: 0, __v: 0 } })
            .exec((err, found) => {
                if (err) reject(err);
                if (found) {
                    resolve({ success: true, message: 'lawfirms found', data: found })
                } else {
                    resolve({ success: false, message: 'could not find list of lawfirms' })
                }
            })
    })
}

exports.sortLawFirmBypracticeArea = (id, pagenumber = 1, pagesize = 20) => {
    return new Promise((resolve, reject) => {
        model.find({ 'practice_area.practice_area_id': id })
            .skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
            .populate({ path: 'lawyer_id', model: 'users', select: { _id: 0, __v: 0, password: 0, status_code: 0, created_at: 0 } })
            .populate({ path: 'practice_area.practice_area_id', model: 'practiceArea' })
            .exec((err, found) => {
                if (err) reject(err);
                if (found) {
                    var maps = found.sort(function (a, b) {
                        return b.name_of_firm.length - a.name_of_firm.length;

                    })
                    resolve({ success: true, message: 'lawfirms found', data: maps })
                } else {
                    resolve({ success: false, message: 'Could  not find data' })
                }
            })
    })
}

exports.sortLawFirmByLocation = (data, pagenumber = 1, pagesize = 20) => {
    return new Promise((resolve, reject) => {
        model.find({ 'country.country_name': data.country, 'state.state_name': data.state })
            .skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
            .populate({ path: 'lawyer_id', model: 'users', select: { _id: 0, __v: 0, password: 0, status_code: 0, created_at: 0 } })
            .populate({ path: 'practice_area.practice_area_id', model: 'practiceArea' })
            .exec((err, found) => {
                if (err) reject(err);
                if (found) {
                    var maps = found.sort(function (a, b) {
                        return b.name_of_firm.length - a.name_of_firm.length;

                    })
                    resolve({ success: true, message: 'lawfirms found', data: maps })
                } else {
                    resolve({ success: false, message: 'Could  not find data' })
                }
            })
    })
}


exports.searchLawfirm = function (option) {
    return new Promise((resolve, reject) => {
        model.find({ name_of_firm: { $regex: option.search, $options: 'i' } }, { _id: 0, __v: 0 })
            .populate({ path: 'lawyer_id', model: 'users', select: { _id: 0, __v: 0, password: 0, status_code: 0, created_at: 0 } })
            .exec((err, found) => {
                if (err) { reject(err); }
                if (found == null || Object.keys(found).length === 0) {
                    resolve({ success: false, data: {}, message: "We could not find what you are looking for." })
                } else {
                    var maps = found.sort(function (a, b) {
                        return b.name_of_firm.length - a.name_of_firm.length;

                    })
                    resolve({ success: true, data: maps, message: "" });
                }
            })
    })
}
