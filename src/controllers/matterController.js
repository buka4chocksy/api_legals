const service = require('../services/getAlawyerService/matterService');
const cloudinary = require('../middlewares/cloudinary');

module.exports = function matterController() {
    this.createMatter = async (req, res) => {
        const files = req.files
        let image = files.image == undefined ? null : files.image[0].path
        var imageFile = { image: image != null && image !== undefined ? image : null }

        //image cloudinary upload
        if (image !== null && image !== undefined) {
            await cloudinary.uploadToCloud(imageFile.image).then(img => {
                imageFile.imageUrl = img.url;
                imageFile.imageId = img.ID
                return imageFile;
            });
        }
        const imageDetails = Object.assign(imageFile, files.image[0])
        await service.getLaywer(req.body, req.auth.user_type, req.auth.public_id, imageDetails, req.auth.Id).then(data => {
            res.status(200).send(data)
        }).catch(err => res.status(500).send(err));
    }

    this.GetClientPendingOpenMatter = async(req, res) => {
      await  service.GetClientPendingOpenMatter(req.auth.public_id, req.params.pagenumber, req.params.pagesize).then(data => {
            res.status(200).send(data)
        }).catch(err => res.status(500).send(err));
    }

    this.getPendingSpecifiedMatter = async(req, res) => {
      await  service.getClientPendingSpecifiedMatter(req.auth.public_id, req.params.pagenumber, req.params.pagesize).then(data => {
            res.status(200).send(data)
        }).catch(err => res.status(500).send(err));
    }

    this.sortClientMatterByPracticeArea = async(req, res) => {
       await service.sortClientMatterByPracticeArea(req.auth.public_id, req.body.practiceArea, req.params.pagenumber, req.params.pagesize).then(data => {
            res.status(200).send(data)
        }).catch(err => res.status(500).send(err));
    }

    this.AvailableMattersForBid = async(req, res) => {
      await  service.AvailableMattersForBid(req.auth.public_id).then(data => {
            res.status(200).send(data)
        }).catch(err => res.status(500).send(err));

    }

    this.bidForCase = async (req, res) => {
        await service.bidForCase(req.query.matterId, req.auth.public_id, req.body.matter_owner)
            .then(data => {
                res.status(200).send(data)
            }).catch(err => res.status(500).send(err));
    }

    this.getSpecificMatterDetails = async (req, res) => {
        await service.getSpecificMatterDetails(req.query.matterId, req.auth.public_id)
            .then(data => {
                res.status(200).send(data)
            }).catch(err => res.status(500).send(err));
    }

    this.ignore_by_client = (req, res) => {
        service.ignore_by_client(req.query.matterId, req.auth.id, req.body.id)
            .then(data => {
                res.status(200).send(data)
            }).catch(err => res.status(500).send(err));
    }

    this.ignore_by_lawyer = async (req, res) => {
        await service.ignore_by_lawyer(req.query.matterId, req.auth.public_id)
            .then(data => {
                res.status(200).send(data)
            }).catch(err => res.status(500).send(err));
    }

    this.get_matter_interested_lawyers = async (req, res) => {
        await service.get_matter_interested_lawyers(req.query.matterId)
            .then(data => {
                res.status(200).send(data)
            }).catch(err => res.status(500).send(err));
    }
}