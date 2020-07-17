const joiValidator = require('../index');



const validate =  (schema) => (req, res, next) => {
        joiValidator(req.body, schema, (err, result) => {
            if(err){
                res.status(400).send(err);
            }else{
                next()
            }
        })
    };

module.exports = {
    validate
}