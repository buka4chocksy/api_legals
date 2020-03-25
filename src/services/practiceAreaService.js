const model = require('../models/practiceArea');

//create practicearea
exports.create = (data) => {
    return new Promise((resolve, reject) => {
        model.findOne({ name: data.name }).then(exists => {
            if (exists) {
                resolve({ success: false, message: 'pracitcearea already exists !!!' })
            } else {
                const detail = { name: data.name }
                model.create(detail).then(created => {
                    if (created) {
                        resolve({ success: true, message: 'practicearea created successfully' })
                    } else {
                        resolve({ success: false, message: 'could not create practicearea' })
                    }
                }).catch(err => reject(err))
            }
        }).catch(err => reject(err));
    })
}

//update practicearea
exports.update = (id, new_name) => {
    return new Promise((resolve, reject) => {
        model.findByIdAndUpdate({ _id: id }, { name: new_name }).then(updated => {
            if (updated) {
                resolve({ success: true, message: 'practicearea updated successfully' })
            } else {
                resolve({ success: false, message: 'Error encountered while updating practice area !!!' })
            }
        }).catch(err => reject(err))
    })
}

//get all practicearea
exports.getAll = ()=>{
    return new Promise((resolve , reject)=>{
        model.find({}).then(data =>{
            if(data){
                resolve({success:true , message:'practiceareas', data:data})
            }else{
                resolve({success:false , message:'no practicearea found !!!'})
            }
        }).catch(err => reject(err));
    })
}

//get single practicearea
exports.getById = (data)=>{
    return new Promise((resolve , reject)=>{
        model.findOne({_id:data}).then(found =>{
            if(found){
                resolve({success:true , message:found })
            }else{
                resolve({success:false , message:'could not find practicearea !!'})
            }
        }).catch(err => reject(err));
    })
}

//delete practicearea
exports.delete = (data)=>{
    return new Promise((resolve , reject)=>{
        model.findOneAndRemove({_id:data}).then(found =>{
            if(found){
                resolve({success:true , message:'practicearea deleted' })
            }else{
                resolve({success:false , message:'could not delete practicearea !!'})
            }
        }).catch(err => reject(err));
    })
}
