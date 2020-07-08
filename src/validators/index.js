const Joi = require('@hapi/joi');

module.exports = function validate(data, schema) {
    return new Promise((resolve, reject) => {
        Joi.validate(data, schema).then(result => {
           resolve();
       }).catch(error => {
           reject(error.details.map(error => error.message));
       });

    })
}