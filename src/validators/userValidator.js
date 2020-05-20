const Joi = require('@hapi/joi');

const schema = Joi.object().keys({
    first_name: [Joi.string().optional(), Joi.allow(null)], //Joi.string().regex(/^[a-z0-9\-]+$/i, 'Please only use alphanumeric characters and the dash ("-").').required(),
    last_name: [Joi.string().optional(), Joi.allow(null)],//Joi.string().min(1).max(100).required(),
    email_address: [Joi.string().email({ minDomainSegments: 2 }).optional(), Joi.allow(null)],
    phone_number: Joi.string().required().max(11),
    oauthID: [Joi.string().optional(), Joi.allow(null)],
    token: [Joi.string().optional(), Joi.allow(null)],
    password: [Joi.string().max(50).optional(), Joi.allow(null)],
})

module.exports = {
    schema
}