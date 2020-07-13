const joiValidator = require('../index');



const validate =  (schema) => {
    return async function (req, res, next) {
        // 
        joiValidator(req.body, schema).then(result => {
            next();
        }).catch(error => {
            
            res.status(400).send(error);
        });
    };
}

module.exports = {
    validate
}