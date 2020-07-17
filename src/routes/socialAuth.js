const router = require('express').Router();
const passport = require('passport');
const authService = require('../services/authService');

module.exports = function () {
    // Google sign-up
    router.get('/auth/google', passport.authenticate('google-signup', { scope: ['profile', 'email'] }));
    router.get('/auth/google/callback',
        passport.authenticate('google-signup', { failureRedirect: '/error' }),
        (req, res) => {
            authService.getUserDetail(req.user.public_id).then(activeUser => {
                const response = {
                    public_id: req.user.public_id,
                    first_name: activeUser.first_name,
                    last_name: activeUser.last_name,
                    email_address: activeUser.email_address
                };
                res.redirect('lawyerpp://signup?user=' + JSON.stringify(response));
            });
        }
    );

    // Google sign-in
    router.get('/auth/google/login', passport.authenticate('google-signin', { scope: ['profile', 'email'] }));
    router.get('/auth/google/callback/login',
        passport.authenticate('google-signin', { failureRedirect: '/error' }),
        (req, res) => {
            generateOAuthLoginDetails(req.user,req, res);
        });

    // Linkedin sign-up
    router.get('/auth/linkedin', passport.authenticate('signup'));
    router.get('/auth/linkedin/callback',
        passport.authenticate('signup', { failureRedirect: '/error' }),
        (req, res) => {
            authService.getUserDetail(req.user.public_id).then(activeUser => {
                const response = {
                    public_id: req.user.public_id,
                    first_name: activeUser.first_name,
                    last_name: activeUser.last_name,
                    email_address: activeUser.email_address
                };
                console.log('response sent to client: ', response);
                res.redirect('lawyerpp://signup?user=' + JSON.stringify(response));
            });
        });


    // LinkedIn sign-in
    router.get('/auth/linkedin/login', passport.authenticate('signin'));
    router.get('/auth/linkedin/callback/login',
        passport.authenticate('signin', { failureRedirect: '/error' }),
        (req, res) => {
            generateOAuthLoginDetails(req.user,req, res);
        });



    const generateOAuthLoginDetails = (userDbDetails,request, response) => {
        const clientIp = request.connection.remoteAddress.includes("::") ? `[${request.connection.remoteAddress}]` : request.connection.remoteAddress;
        let { email_address, phone_number, public_id, user_type, first_name, last_name, image_url, id } = userDbDetails;
        let jwtTokenDetails = {
            email_address: email_address,
            phone_number: phone_number,
            public_id: public_id,
            user_type: user_type,
        };
        let userDetails = {
            ...jwtTokenDetails,
            first_name: first_name,
            last_name: last_name,
            image_url: image_url
        };
        authService.generateUserAuthenticationResponse(userDetails, id, clientIp, true).then(result => {
            let dataToReturn = { success: true, data: { userDetails, authDetails: result.data }, message: 'authentication successful', status: 200 };
            response.redirect('lawyerpp://login?user=' + JSON.stringify(dataToReturn));
        }).catch(error => {
            //log error here with logger
        });

    };
    return router;
};