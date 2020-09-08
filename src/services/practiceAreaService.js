const model = require('../models/practicearea/practiceArea');

//create practicearea
const createPracticeArea = async (data) => {
    try {

        let find_practice_area = await model.findOne({ name: data.name })
        if (find_practice_area) {
            return { success: false, message: 'pracitce area already  exists', status: 409 }
        } else {
            const detail = { name: data.name }
            let create_pracitce_area = await model.create(detail)
            if (create_pracitce_area) {
                return { success: true, message: 'practice area created successfully', status: 201 }
            } else {
                return { success: false, message: 'could not create practic earea', status: 400 }
            }
        }
    } catch (err) {
        return err
    }

}

//update practicearea
const updatePracticeArea = (id, new_name) => {
    return new Promise((resolve, reject) => {
        model.findByIdAndUpdate({ _id: id }, { name: new_name }).then(updated => {
            if (updated) {
                resolve({ success: true, message: 'practic earea updated successfully', status: 200 })
            } else {
                resolve({ success: false, message: 'Error encountered while updating practice area', status: 400 })
            }
        }).catch(err => reject({ err: err, status: 500 }))
    })
}

//get all practicearea
const getAllPracticeArea = async () => {
    try {
        let getpracitcearea = await model.find({}).sort({ name: 'asc' })
        if (getpracitcearea) {
            return { success: true, message: 'practice areas retrieved', data: getpracitcearea, status: 200 }
        } else {
            return { success: false, message: 'no practice area found', status: 404 }
        }
    } catch (err) {

    }
}

//get single practicearea
const getPracticeAreaById = async (id) => {
    try {
        let findSingle = await model.findOne({ _id: id })
        if (findSingle) {
            return { success: true, data: findSingle, message: "practicearea found", status: 200 }
        } else {
            return { success: false, message: 'could not find practice area', status: 404 }
        }
    } catch (err) {
        return err
    }

}

//delete practicearea
const deletePracticeArea = async (id) => {
    try {
        let deletePracticearea = await model.findOneAndRemove({ _id: id })
        if (deletePracticearea) {
            return { success: true, message: 'practice area deleted', status: 200 }
        } else {
            return { success: false, message: 'could not delete practice area', status: 400 }
        }
    } catch (err) {
        return err
    }
}

module.exports = {
    createPracticeArea, updatePracticeArea, getAllPracticeArea, getPracticeAreaById, deletePracticeArea
}
