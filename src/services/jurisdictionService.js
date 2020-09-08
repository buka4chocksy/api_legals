const model = require('../models/lawyer/jurisdiction');

//create jurisdiction
const createJurisdiction = async (data) => {
    try {
        let findjurisdiction = await model.findOne({ name: data.name })
        if (findjurisdiction) {
            return { success: false, message: 'jurisdiction already exists ', status: 409 }
        } else {
            const detail = { name: data.name }
            let create_jurisdiction = await model.create(detail)
            if (create_jurisdiction) {
                return { success: true, message: 'jurisdiction created successfully', status: 200 }
            } else {
                return { success: false, message: 'could not create jurisdiction', status: 400 }
            }
        }
    } catch (err) {
        return err
    }
}

//update jurisdiction
const updateJurisdiction = async (id, new_name) => {
    try {
        let update_jurisdiction = await model.findByIdAndUpdate({ _id: id }, { name: new_name })
        if (update_jurisdiction) {
            return { success: true, message: 'jurisdiction updated successfully', status: 200 }
        } else {
            return { success: false, message: 'Error encountered while updating jurisdiction ', status: 400 }
        }
    } catch (err) {
        return err
    }
}

//get all jurisdiction
const getAllJurisdiction = async () => {
    try {
        let find_jurisdiction = await model.find({}).sort({ name: 'asc' })
        if (find_jurisdiction) {
            return { success: true, message: 'jurisdiction retrieved', data: find_jurisdiction, status: 200 }
        } else {
            return { success: false, message: 'no jurisdiction found ', status: 404 }
        }
    } catch (err) {
        return err
    }
}

//get single jurisdiction
const getJurisdictionById = async (data) => {
    try {
        let find_jurisdiction = await model.findOne({ _id: data })
        if (find_jurisdiction) {
            return { success: true, message: find_jurisdiction, status: 200 }
        } else {
            return { success: false, message: 'could not find jurisdiction !!', status: 404 }
        }
    } catch (err) {
        return err
    }

}

//delete jurisdiction
const deleteJurisdiction = async (data) => {
    let delete_jurisdiction = await model.findOneAndRemove({ _id: data })
    if (delete_jurisdiction) {
        return { success: true, message: 'jurisdiction deleted', status: 200 }
    } else {
        return { success: false, message: 'could not delete jurisdiction !!', status: 400 }
    }
}

module.exports = {
    createJurisdiction, getAllJurisdiction, updateJurisdiction, getAllJurisdiction, getJurisdictionById, deleteJurisdiction
}
