const service = require('../services/matterService');
const cloudinary = require('../middlewares/cloudinary');

module.exports =  function matterController(){
    this.createMatter = async(req,res)=>{
        var requestDetails = {
            image: req.file != null && req.file !== undefined ? req.file.path : null
        };

        if (req.image !== null && req.file !== undefined) {
            await cloudinary.uploadToCloud(requestDetails.image).then(img => {
                requestDetails.imageUrl = img.url;
                return requestDetails;
            });
        }
        service.getLaywer(req.body , req.auth.publicId , requestDetails).then(data =>{
        res.status(200).send(data)
        }).catch(err => res.status(500).send(err));
    }

    this.GetClientPendingOpenMatter = (req,res)=>{
        service.GetClientPendingOpenMatter(req.auth.publicId , req.params.pagenumber, req.params.pagesize).then(data =>{
            res.status(200).send(data)
            }).catch(err => res.status(500).send(err));
    }

    this.getPendingSpecifiedMatter = (req,res)=>{
        service.getClientPendingSpecifiedMatter(req.auth.publicId , req.params.pagenumber, req.params.pagesize).then(data =>{
            res.status(200).send(data)
            }).catch(err => res.status(500).send(err));
    }

    this.sortClientMatterByPracticeArea = (req,res)=>{
        service.sortClientMatterByPracticeArea(req.auth.publicId , req.body.practiceArea ,req.params.pagenumber, req.params.pagesize).then(data =>{
            res.status(200).send(data)
            }).catch(err => res.status(500).send(err));
    }
    
}