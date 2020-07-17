var cloudinary = require('cloudinary').v2;
var cloudinaryPath = process.env.CLOUDINARY_FOLDER_PATH
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloud = async (filename, folder = "public") => {
    try{
        var result = await   cloudinary.uploader.upload(filename,{folder : `/lawyerpp/${cloudinaryPath}/${folder}/`, return_delete_token : true, resource_type : "auto"})
        return result;
    }catch(err){
        console.log("ERRORR",err)
        return null;
    }
};



const deleteFromCloud = function (fileId) {
    return cloudinary.uploader.destroy(fileId, function (result) {
        //console.log("HERE S THE ERROR", err)
        console.log("check here for destroy",fileId, result )
        return Promise.resolve(result);
    });
};

const multipleUpload = function (filenames = []) {
    console.log("in clodinary method", filenames);
    return new Promise((resolve, reject) => {
        var responses = [];
        var newNonEmptyArray = filenames.filter((value, index) => {
            return value !== '' && value !== null;
        });
        if (newNonEmptyArray && newNonEmptyArray.length === 0) {
            resolve(responses);
        } else {
            newNonEmptyArray.forEach((file, index) => {
                if (file !== '') {
                    cloudinary.uploader.upload(file).then(result => {
                        responses.push({
                            url: result.secure_url,
                            ID: result.public_id
                        });
                        if (index == newNonEmptyArray.length - 1) {
                            resolve(responses);
                        }
                    }
                    ).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve([]);
                }
            });
        }
    });
};

module.exports = {
    uploadToCloud, deleteFromCloud, multipleUpload
}