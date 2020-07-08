const model = require('../models/lawyer/matter');
const userFormatter = require('../utils/userFormatter');
exports.getLaywer = (options, userId, audio ,image  ) => {
    return new Promise((resolve, reject) => {
        if (options.timelimit < Date.now()) {
            resolve({ success: false, message: 'please insert a valid deadline date !!!' })
        } else {
            userFormatter.getClientId(userId).then(user => {
                if(user){
                    const detail = {
                        client_name: options.client_name,
                        matter_title: options.matter_title,
                        matter_description: options.matter_description,
                        country: options.country,
                        state: options.state,
                        Imagefile:[{
                            imageUrl:image,
                        }],
                        audiofile:[{
                            audioUrl:audio,
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
                }else{
                    resolve({success:false , message:'Could not find client'})
                }
             
            })

        }
    })
}

exports.GetClientPendingOpenMatter = (userId, pagenumber = 1, pagesize = 20) => {
    return new Promise((resolve, reject) => {
        userFormatter.getClientId(userId).then(user =>{
            model.find({ clientid: user, status: null, completed: false  , public:true })
            .skip((parseInt(pagenumber) - 1) * parseInt(pagesize))
            .limit(parseInt(pagesize))
            .populate({ path: "clientid", model: 'client', select: { _id: 0, __v: 0 } })
            .populate({ path: "practiceArea.practiceArea_id", model: 'practiceArea', select: { _id: 0, __v: 0 } })

            .exec((err, result) => {
                if (err) {
                    resolve({ data: null, message: "No Matter found", success: false, error: err });
                } else {
                    resolve({ success: true, data: result, message: "All pending matter" });
                }
            });
        }).catch(err =>reject(err));

    });
};

exports.getClientPendingSpecifiedMatter = (userId ,pagenumber = 1, pagesize = 20 )=>{
    return new Promise((resolve , reject)=>{
        userFormatter.getClientId(userId).then(user =>{
            model.find({clientid:user , status:null , completed:false , public:false , 'specifiedLawyer.status':false})
            .skip((parseInt(pagenumber) - 1) * parseInt(pagesize))
            .limit(parseInt(pagesize))
            .populate({ path: "clientid", model: 'client', select: { _id: 0, __v: 0 } })
            .populate({ path: "practiceArea.practiceArea_id", model: 'practiceArea', select: { _id: 0, __v: 0 } })

            .exec((err, result) => {
                if (err) {
                    resolve({ data: null, message: "No Matter found", success: false, error: err });
                } else {
                    resolve({ success: true, data: result, message: "All pending matter" });
                }
            });
        }).catch(err =>reject(err));
    })
}

exports.sortClientMatterByPracticeArea = (userId ,practiceArea , pagenumber = 1, pagesize = 20 )=>{
    return new Promise((resolve , reject)=>{
        userFormatter.getClientId(userId).then(user =>{
            model.find({clientid:user , 'practiceArea.practiceArea_id':practiceArea , status:null , completed:false , public:true  })
            .skip((parseInt(pagenumber) - 1) * parseInt(pagesize))
            .limit(parseInt(pagesize))
            .populate({ path: "clientid", model: 'client', select: { _id: 0, __v: 0 } })
            .populate({ path: "practiceArea.practiceArea_id", model: 'practiceArea', select: { _id: 0, __v: 0 } })
            .exec((err , found)=>{
                if(err)reject(err);
                if(found){
                    resolve({success:true , message:'client matter', data:found})
                }else{
                    resolve({success:false , message:'could not get matters related to client'})
                }
            })
        })
    })
}