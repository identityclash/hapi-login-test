/**
 * Created by Omnius on 18/07/2016.
 */
'use strict';

const Extension = require('joi-date-extensions');
const BaseJoi = require('joi');

const Joi = BaseJoi.extend(Extension);

module.exports = {
    username: Joi.string().required().min(3).max(20).regex(/^([a-zA-Z0-9]{3,20})$/),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8).max(20).regex(/^([a-zA-Z0-9!@#$%^&*()]{8,20})$/),
    firstname: Joi.string().required().min(2).max(20).regex(/^([a-zA-Z0-9]{3,20})$/),
    surname: Joi.string().required().min(2).max(20).regex(/^([a-zA-Z0-9]{3,20})$/),
    birthdate: Joi.date().required().iso().format('YYYY-MM-DD').min('1900-01-01').max('2013-12-31'),
    realm: Joi.string().regex(/^([a-zA-Z0-9@*#\s]{0,15})$/)
};
