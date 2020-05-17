const Joi = require('@hapi/joi');

const schema = Joi.object().keys({
    first_name: Joi.string().regex(/^[a-z0-9\-]+$/i, 'Please only use alphanumeric characters and the dash ("-").').required(),
    last_name: Joi.string().min(1).max(100).required(),
    email_address: Joi.string().email({ minDomainSegments: 2 }).required(),
    phone_number: Joi.string().required().max(20),
    oauthID: [Joi.string().optional(), Joi.allow(null)],
    password: Joi.string().required().max(50),
    confirm_password: Joi.string().required().max(50)
})

module.exports = {
    schema
}