const model = require('../models/client/client');
const user = require('../models/auth/users');
let jsonPatch = require('fast-json-patch')

//profile picture update
exports.profilePicture = async (id, data) => {
    try {
        const detail = {
            image_url: data.imageUrl,
            image_id: data.imageID
        }
        let updateProfile = await model.findOneAndUpdate({ public_id: id }, detail)
        if (updateProfile) {
            return { success: true, message: 'profile picture updated ', status: 200 }
        } else {
            return { success: false, message: 'Error updating profile picture', status: 400 }
        }
    } catch (err) {
        return err
    }
}
//edit client profile
exports.editClientProfile = async (id, data) => {
    try {
        let findClientProfile = await model.findOne({ public_id: id })
        if (!findClientProfile) {
            return { success: true, message: 'client profile not updated', status: 200 }
        } else {
            var updateProfile = jsonPatch.applyPatch(findClientProfile.toObject(), data);
            let updatedResult = await model.findOneAndUpdate({ public_id: id }, updateProfile.newDocument, { upsert: true, new: true })
            if (updatedResult) {
                return { success: true, message: 'client profile updated successfully', status: 200 }
            } else {
                return { success: true, message: 'could not update client profile', status: 200 }

            }
        }
    } catch (err) {
        return err
    }
}

//delete client account
exports.deleteAccount = async (id, publicId) => {
    try {
        let delete_client = await model.findOneAndRemove({ public_id: publicId })
        if (delete_client) {
            let remove_user = await user.findByIdAndDelete({ _id: id })
            if (remove_user) {
                return { success: true, message: 'account deleted', status: 200 }
            } else {
                return { success: false, message: 'error deleting account !!!', status: 400 }
            }
        } else {
            return { success: false, message: 'error deleting account !!!', status: 400 }

        }
    } catch (err) {
        return err
    }
}
//get client profile
exports.getClientProfile = async (publicId) => {
    try {
        let getclient = await model.findOne({ public_id: publicId })
        if (getclient) {
            return { success: true, message: 'client profile', data: getclient, status: 200 }
        } else {
            return { success: false, message: 'could not find client details', status: 400 }
        }
    } catch (err) {
        return err
    }
}