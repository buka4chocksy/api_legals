const Joi = require('@hapi/joi');

module.exports = (data, schema, cb) => {
        const { error, value }    = schema.validate(data);
        // console.log("data check", error, value, data)
        if(error){
            cb(error.details.map(error => error.message), null);
        }else{
            cb(null, value);
        }
        return {error, value};
}