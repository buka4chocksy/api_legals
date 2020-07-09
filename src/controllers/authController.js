const service = require('../services/authService')
const cloudinary = require('../middlewares/cloudinary');
module.exports = function authController() {

    this.register = (req, res, next) => {
        //const device = req.body.deviceID || req.query.deviceID || req.headers['device-id'];
        const token = req.body.token || req.query.token || req.headers['x-access-token'];
        console.log(req.body)
        service.Register(req.body, res).then(data => {
            res.status(data.status).send(data)
        }).catch(err => {
            console.log(err)
            res.status(err.status).send(err)
        });
    }

    this.updatePhonenumberForOAuthRegistration = (req, res, next) => {
        const {publicid} = req.params;
        service.updatePhonenumberForOAuthRegistration(publicid, req.body.phone_number).then(result => {
            res.status(result.status).send(result)
        }).catch(error => {
            next(error);
        })
    }

    this.verifyUser = (req, res) => {
        service.verifyUser(req.auth.email ,req.body).then(data => {
            res.status(200).send(data)
        }).catch(err => res.status(500).send(err));
    }

    this.loginUser = (req, res) => {
        const clientIp = req.connection.remoteAddress.includes("::") ? `[${req.connection.remoteAddress}]` : req.connection.remoteAddress;
        const device = req.body.deviceID || req.query.deviceID || req.headers['device-id']
        console.log("check login", clientIp);

        service.userLogin(req.body.email_address, req.body.password ,device, clientIp).then(data => {
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }


    this.terms = (req, res) => {
        const clientIp = req.connection.remoteAddress.includes("::") ? `[${req.connection.remoteAddress}]` : req.connection.remoteAddress;

        service.acceptTerms(req.body, req.params.publicid, clientIp).then(data => {
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.passwordToken = (req, res) => {
        service.sendPasswordChangeToken(req.body).then(data => {
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }
    this.ChangeforgotPassword = (req, res) => {
        service.ChangeforgotPassword(req.body).then(data => {
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
        const device = req.body.deviceID || req.query.deviceID || req.headers['device-id']

        service.refreshToken(device).then(data => {
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

}