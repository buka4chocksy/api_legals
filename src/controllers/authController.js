const service = require('../services/authService')
const {addNextofKinDetails}  = require('../services/common/nextOfKinService');
const cloudinary = require('../middlewares/cloudinary')

module.exports = function authController() {

    this.register = (req, res, next) => {
        const token = req.body.token || req.query.token || req.headers['x-access-token'];
        service.Register(req.body, res).then(data => {
            res.status(data.status).send(data)
        }).catch(err => {
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
        service.userLogin(req.body.email_address, req.body.password ,device, clientIp, res).then(data => {
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }


    this.terms = (req, res) => {
        const clientIp = req.connection.remoteAddress.includes("::") ? `[${req.connection.remoteAddress}]` : req.connection.remoteAddress;
        service.acceptTerms(req.body, req.params.publicid, clientIp).then(data => {
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.DBupdateToken = (req,res)=>{
        const token = req.body.token || req.query.token || req.headers['x-access-token']
        const device = req.body.deviceID || req.query.deviceID || req.headers['device-id']
        service.DBupdateToken(req.auth.public_id , token, device).then(data => {
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.refreshToken = (req,res)=>{
        const clientIp = req.connection.remoteAddress.includes("::") ? `[${req.connection.remoteAddress}]` : req.connection.remoteAddress;
        service.refreshToken(req.auth, clientIp).then(data => {
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.confirmPassword = (req, res)=>{
        service.confimPassword(req.auth.public_id, req.body.password).then(data =>{
            res.status(data.status).send(data)
        }).catch(err =>{
            res.status(err.status).send(err)});
    }

    this.AddNextOfKinOnRegistration = (req, res, next) => {
        let {publicid} = req.params;
        addNextofKinDetails(publicid, req.body, true).then(result => res.status(result.status).send(result) )
        .catch(next);
    }

    this.passwordToken = (req, res) => {
        service.sendForgotPasswordToken(req.body.email_address).then(data => {
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.verifyOtp = (req, res) => {
        service.verifyUserOtp(req.body).then(data => {
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.changeForgotPassword = (req, res) => {
        const data = {
            email_address: req.body.email_address,
            password: req.body.password,
            confirm_password: req.body.confirm_password
        }
        service.changeForgotPassword(data).then(data => {
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

    this.changePassword = (req, res) => {
        const data = {
            password: req.body.password,
            comfirm_password: req.body.new_password
        }
        service.changePassword(req.auth.public_id, data).then(data => {
            res.status(data.status).send(data)
        }).catch(err => res.status(err.status).send(err));
    }

}