const service = require('../services/matterService');
const cloudinary = require('../middlewares/cloudinary');

module.exports = function matterController() {
    this.createMatter = async (req, res) => {
        const files = req.files
        
        let audio = files.audio == undefined ? null : files.audio[0].path
        let image = files.image == undefined ? null :files.image[0].path
        var audioFile = { audio: audio != null && audio !== undefined ? audio : null };
        var imageFile = { image: image != null && image !== undefined ? image : null }
        // audio cloudinary upload
        if (audio !== null && audio !== undefined) {
            await cloudinary.uploadToCloud(audioFile.audio).then(result => {
                audioFile.audioUrl = result.url;
                return audioFile;
            });
        }
        //image cloudinary upload
        if (image !== null && image !== undefined) {
            await cloudinary.uploadToCloud(imageFile.image).then(img => {
                imageFile.imageUrl = img.url;
                return imageFile;
            });
        }
        service.getLaywer(req.body, req.auth.public_id, audioFile.audioUrl, imageFile.imageUrl).then(data => {
            res.status(200).send(data)
        }).catch(err => res.status(500).send(err));
    }

    this.GetClientPendingOpenMatter = (req, res) => {
        service.GetClientPendingOpenMatter(req.auth.public_id, req.params.pagenumber, req.params.pagesize).then(data => {
            res.status(200).send(data)
        }).catch(err => res.status(500).send(err));
    }

    this.getPendingSpecifiedMatter = (req, res) => {
        service.getClientPendingSpecifiedMatter(req.auth.public_id, req.params.pagenumber, req.params.pagesize).then(data => {
            res.status(200).send(data)
        }).catch(err => res.status(500).send(err));
    }

    this.sortClientMatterByPracticeArea = (req, res) => {
        service.sortClientMatterByPracticeArea(req.auth.public_id, req.body.practiceArea, req.params.pagenumber, req.params.pagesize).then(data => {
            res.status(200).send(data)
        }).catch(err => res.status(500).send(err));
    }

}