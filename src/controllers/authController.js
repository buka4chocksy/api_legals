const service = require('../services/authService')
const cloudinary = require('../middlewares/cloudinary');
module.exports = function authController() {

    this.Register = (req, res, next) => {
        const device = req.body.deviceID || req.query.deviceID || req.headers['device-id'];
        const token = req.body.token || req.query.token || req.headers['token'];
        service.Register(req.body, device, token).then(data => {
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.verifyUser = (req, res) => {
    
        service.verifyUser(req.auth.email ,req.body).then(data => {
            res.status(200).send(data)
        }).catch(err => res.status(500).send(err));
    }

    this.loginUser = (req, res) => {
        service.userLogin(req.body.email_address, req.body.password).then(data => {
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }


    this.terms = (req, res) => {
        service.acceptTerms(req.body, req.auth.publicId).then(data => {
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }


    this.changePassword = (req, res) => {
        const data = {
            password: req.body.password,
            comfirm_password: req.body.new_password
        }
        service.changePassword(req.auth.publicId, data).then(data => {
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.DBupdateToken = (req,res)=>{
        const token = req.body.token || req.query.token || req.headers['x-access-token']
        const device = req.body.deviceID || req.query.deviceID || req.headers['device-id']
        service.DBupdateToken(req.auth.publicId , token, device).then(data => {
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.refreshToken = (req,res)=>{
        const token = req.body.token || req.query.token || req.headers['x-access-token']
        const device = req.body.deviceID || req.query.deviceID || req.headers['device-id']

        service.refreshToken(token , device).then(data => {
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

}