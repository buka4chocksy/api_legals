const model = require('../../models/lawyer/matter');
const user = require('../../models/auth/users')
const lawyer = require('../../models/lawyer/lawyer')
const userFormatter = require('../../utils/userFormatter');
const location = require('../../utils/mapUtil');
const interested_lawyers = require("../../models/lawyer/interestedLawyers");

exports.getLaywer = async (options, usertype, publicId, image, Id) => {
    try {
        const Today = new Date()
        if (options.timelimit <= Today) {
            resolve({ success: false, message: 'please insert a valid deadline date !!!' })
        } else {
            let locationDetails = await location.getLocation(options.latitude, options.longitude)
            const detail = {
                case_owner: {
                    user_detail: Id,
                    publicId: publicId,
                    name: options.client_name,
                    user_type: usertype,
                },
                title: options.matter_title,
                matter_description: options.matter_description,
                case_files: [{
                    case_file_url: image.image,
                    case_file_secure_url: image.imageUrl,
                    case_file_id: image.imageId,
                    case_file_delete_token: "",
                    case_file_resource_type: "",
                    case_file_public_id: "",
                    case_file_name: image.filename,
                    case_file_mime_type: image.mimetype,
                }],
                location: {
                    local_address: locationDetails.results[0].formatted_address,
                    latitude: options.latitude,
                    longitude: options.longitude,
                    place_id: locationDetails.results[0].place_id
                },
                specified_practiceareas: [{
                    practiceArea_id: options.practiceArea
                }],
                deadline: options.timelimit,
            }
            let create_matter = await model.create(detail)
            if (create_matter) {
                return { success: true, message: 'your request was sent successfully!!' }
            } else {
                return { success: false, message: 'your request was not sent successfully' }
            }
        }
    } catch (err) {
        return err
    }

}


exports.GetClientPendingOpenMatter = async (userId, pagenumber = 1, pagesize = 20) => {
    try {
        let getPendingMatter = await model.find({ "case_owner.publicId": userId, is_available: true, is_public: true })
            .skip((parseInt(pagenumber) - 1) * parseInt(pagesize))
            .limit(parseInt(pagesize))
            .populate({ path: "case_owner.user_detail", model: 'user', select: { first_name: 1, last_name: 1, email_address: 1, phone_number: 1 } })
            .populate({ path: "specified_practiceareas.practiceArea_id", model: 'practiceArea', select: { _id: 0, __v: 0 } })
        if (!getPendingMatter) {
            return { data: null, message: "No Matter found", success: false, error: err }
        } else {
            return { success: true, data: getPendingMatter, message: "All pending matter" }
        }
    } catch (err) {
        return err
    }
};

exports.getClientPendingSpecifiedMatter = async (userId, pagenumber = 1, pagesize = 20) => {
    try {
        let getPendingSpecifiedMatter = await model.find({ "case_owner.publicId": userId, is_available: true, is_public: false })
            .skip((parseInt(pagenumber) - 1) * parseInt(pagesize))
            .limit(parseInt(pagesize))
            .populate({ path: "case_owner.user_detail", model: 'user', select: { first_name: 1, last_name: 1, email_address: 1, phone_number: 1 } })
            .populate({ path: "specified_practiceareas.practiceArea_id", model: 'practiceArea', select: { _id: 0, __v: 0 } })
        if (!getPendingSpecifiedMatter) {
            return { data: null, message: "No Matter found", success: false, error: err }
        } else {
            return { success: true, data: getPendingSpecifiedMatter, message: "All pending matter" }
        }
    } catch (err) {
        return err
    }
}

exports.sortClientMatterByPracticeArea = async (userId, practiceArea, pagenumber = 1, pagesize = 20) => {
    try {
        let sortMatter = await model.find({ "case_owner.publicId": userId, 'specified_practiceareas.practiceArea_id': practiceArea })
            .skip((parseInt(pagenumber) - 1) * parseInt(pagesize))
            .limit(parseInt(pagesize))
            .populate({ path: "case_owner.user_detail", model: 'user', select: { first_name: 1, last_name: 1, email_address: 1, phone_number: 1 } })
            .populate({ path: "specified_practiceareas.practiceArea_id", model: 'practiceArea', select: { _id: 0, __v: 0 } })
        if (!sortMatter) {
            return { data: null, message: "No Matter found", success: false, error: err }
        } else {
            return { success: true, data: sortMatter, message: "All client  practicearea matter" }
        }
    } catch (err) {
        return err
    }
};

exports.AvailableMattersForBid = async (id) => {
    try {
        let get_matter = await model.find({ $and: [{ is_available: true }, { "case_owner.publicId": { $ne: id } }] })
            .populate({ path: "case_owner.user_detail", model: 'user', select: { first_name: 1, last_name: 1, email_address: 1, phone_number: 1 } })
            .populate({ path: "specified_practiceareas.practiceArea_id", model: 'practiceArea', select: { _id: 0, __v: 0 } })
        if (get_matter) {
            return { success: true, message: "available matters", data: get_matter }
        } else {
            return { success: false, message: "Related matter not available !!!" }
        }
    } catch (err) {
        return err
    }
}

exports.bidForCase = async (matterId, publicId, matterOwner) => {
    try {
        let formatUserDetails = await userFormatter.getLawyerId(publicId)
        if (formatUserDetails) {
            let checkExstingBid = await interested_lawyers.findOne({ matter_id: matterId, public_id: publicId })
            if (checkExstingBid) {
                return { success: false, message: "sorry you already bidded for this case" }
            } else {
                const details = {
                    lawyer_detail: formatUserDetails,
                    public_id: publicId,
                    matter_id: matterId,
                    user_detail: matterOwner
                }
                let createBid = await interested_lawyers.create(details)
                if (createBid) {
                    return { success: true, message: "matter was bidded successfully" }
                } else {
                    return { success: false, message: "Error occured while bidding for matter" }
                }
            }
        } else {
            return { success: false, message: "un-authorized access" }
        }
    } catch (err) {
        return err
    }
}

exports.getSpecificMatterDetails = async (matterId, publicId) => {
    try {
        let get_user_matter = await model.findOne({ "case_owner.publicId": publicId, _id: matterId })
            .populate({ path: "case_owner.user_detail", model: 'user', select: { first_name: 1, last_name: 1, email_address: 1, phone_number: 1 } })
            .populate({ path: "specified_practiceareas.practiceArea_id", model: 'practiceArea', select: { _id: 0, __v: 0 } });
        if (get_user_matter) {
            return { success: true, message: "user matters", data: get_user_matter }
        } else {
            return { success: true, message: "error getting user matters" }
        }

    } catch (err) {
        return err
    }
}


exports.ignore_by_client = async (matterId, publicId, lawyerId) => {
    try {
        let client_ignore_matter = await model.findOneAndUpdate({ $and: [{ user_detail: publicId }, { matter_id: matterId }, { lawyer_detail: lawyerId }] },
            { ignore: true })
        if (client_ignore_matter) {
            return { success: true, message: "matter have been successfully ignored" }
        } else {
            return { success: false, message: "could not ignore matter" }
        }
    } catch (err) {
        return err
    }


}


exports.ignore_by_lawyer = async (matterId, LawyerId) => {
    console.log(matterId, LawyerId)
    try {
        const ignore_matter = await interested_lawyers.findOneAndUpdate({ $and: [{ matter_id: matterId }, { public_id: LawyerId }] }, { ignore: true })
        if (ignore_matter) {
            return { success: true, message: "matter have been successfully ignored" }
        } else {
            return { success: false, message: "could not ignore matter" }
        }
    } catch (err) {
        return err

    }
}

exports.get_matter_interested_lawyers = async (matterId) => {
    try {
        let get_matter_interested_lawyers = await interested_lawyers.find({ $and: [{ matter_id: matterId }, { ignore: false }] })
            .populate({ path: "matter_id", model: 'matter', select: { _id: 0, __v: 0 } })
            .populate({ path: "user_detail", model: 'user', select: { _id: 0, __v: 0 } })
            .populate({ path: "lawyer_detail", model: 'lawyer', select: { _id: 0, __v: 0 } });
        if (get_matter_interested_lawyers) {
            return { success: true, message: "matter interested lawyers", data: get_matter_interested_lawyers }
        } else {
            return { success: false, message: "could not get matter interested lawyers" }
        }
    } catch (err) {
        return err
    }
}


