const model = require('../models/matter');
const userFormatter = require('../utils/userFormatter');
exports.getLaywer = (options, userId, image) => {
    return new Promise((resolve, reject) => {
        if (options.timelimit < Date.now()) {
            resolve({ success: false, message: 'please insert a valid deadline date !!!' })
        } else {
            userFormatter.getClientId(userId).then(user => {
                const detail = {
                    first_name: options.first_name,
                    last_name: options.last_name,
                    practiceArea: options.practiceArea,
                    matter_title: options.matter_title,
                    matter_description: options.matter_description,
                    country: options.country,
                    state: options.state,
                    file:[{
                        url:image.imageUrl,
                    }],
                    practiceArea: [{
                        practiceArea_id: options.practiceArea
                        }],
                    deadline: options.deadline,
                    clientid: user
                }
                model.create(detail).then(created => {
                    if (created) {
                        resolve({success:true , message:'your request was sent successfully!!'})
                    } else {
                        resolve({ success: false, message: 'your request was not sent successfully' })
                    }
                }).catch(err => reject(err));
            })

        }
    })
}