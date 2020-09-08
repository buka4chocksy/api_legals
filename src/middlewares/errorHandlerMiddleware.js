var mongoose = require('mongoose');
var mongooseValidationError = mongoose.Error.ValidationError;
var isProduction = process.env.NODE_ENV;
var joiValidator = require('../validators/index');

module.exports.ErrorHandler = function (req, res, next, error) {
 
        if (error instanceof mongooseValidationError) {
            ;
            const errorMessages = Object.values(error.errors).map(e => e.message);
            res.status(400).send({data : errorMessages, success : false, 
                messge : 'validation error occurred check your inputs for corrections '})
        }
        else if (error.hasOwnProperty('name') && error.name === 'MongoError') {
            res.locals.status = responseToSend.INVALID;
            if(error.code === 11000){
                res.locals.error = 'There was a duplicate key error';
                res.status(400).send({data : null, message : 'the entry already exist', success : false});
            }else{
                res.status(400).send({data : error.errmsg, message : 'the entry already exist', success : false});
            }
        }
        else if(error.handled){
            delete error.handled;
            res.status(error.status).send(error);
        }
        else {
            const message = isProduction ? "An unexpected error has occured. Please, contact the administrator" : error.message;
            res.status(500).send({data : null, message : message, success : false});

        }
        if (!isProduction) 
        {}
        next();
};

module.exports.schemaValidatorHandler = (schema) => {
    return async (req, res, next) =>{
        joiValidator(req.body, schema).then(result => {
            next();
        }).catch(error => {
            res.status(400).send({ success: false, message: error, data: null })
        });
    };
}