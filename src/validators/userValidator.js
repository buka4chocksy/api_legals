const Joi = require('@hapi/joi');

const schema = Joi.object().keys({
    first_name: [Joi.string().optional(), Joi.allow(null)],
    last_name: [Joi.string().optional(), Joi.allow(null)],
    email_address: Joi.string().required().email({ minDomainSegments: 2 }),
    phone_number: Joi.string().required(),
    oauthID: [Joi.string().optional(), Joi.allow(null)],
    deviceID: [Joi.string().optional(), Joi.allow(null)],
    token: [Joi.string().optional(), Joi.allow(null)],
    password: [Joi.string().max(50), Joi.allow(null)],
    local: Joi.string()
}).with('password', 'local')

const PhoneNumberSchema = Joi.object().keys({
    phone_number : Joi.string().required()
})

module.exports = {
    schema, PhoneNumberSchema
}