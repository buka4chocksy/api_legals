const Joi = require('@hapi/joi');

module.exports = function validate(data, schema) {
    return new Promise((resolve, reject) => {
      schema.validateAsync(data)
        .then(result => {
           resolve();
       }).catch(error => {
           console.log(error)
           reject(error.details[0].message);
       });

    })
}