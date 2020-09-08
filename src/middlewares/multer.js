var multer = require('multer');

//adjust how files are stored
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        //Sets destination for fileType
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
            callback(null, './uploads/images/');
        } else if (file.mimetype === 'audio/mpeg') {
            callback(null, './uploads/audio/');
        } else {
            callback(null, './uploads/pdfs/');
        }
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '_' + file.originalname);
    },
});

var fileFilter = function (req, file, callback) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf' || file.mimetype === 'application/msword') {
        callback(null, true);
    } else if (file.mimetype === 'audio/mpeg') {
        callback(null, true);
    } else {
        callback(new Error('Image upload failed. Supports only jpeg, png, doc and pdf files'), false);
    }
}

var fileSize = function () {
    var size = 1024 * 1024 * 15;
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword') {
        size = 1024 * 1024 * 250;
        return size;
    } else return size;
}

exports.upload = multer({
    storage: storage,
    limits: {
        fileSize: fileSize
    },
    fileFilter: fileFilter
});
