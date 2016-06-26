/**
 * Created by Omnius on 6/25/16.
 */
'use strict';

const Joi = require('joi');

module.exports = [
    {
        // Web login
        path: '/',
        method: '*',
        config: {
            auth: {
                mode: 'try',
                strategies: ['hawk-login-auth-strategy']
            },
            handler: {
                webHandler: {
                    type: 'index'
                }
            }
        }
    },
    {
        // Web login
        path: '/login',
        method: '*',
        config: {
            auth: {
                mode: 'try',
                strategies: ['hawk-login-auth-strategy']
            },
            handler: {
                webHandler: {
                    type: 'index'
                }
            }
        }
    },
    {
        // Web registration
        path: '/registration',
        method: '*',
        handler: {
            webHandler: {
                type: 'registration'
            }
        }
    },
    {
        // Web welcome page
        path: '/user/welcome',
        method: 'POST',
        config: {
            auth: {
                mode: 'required',
                strategies: ['basic-login-auth-strategy']
            },
            handler: {
                loginUserHandler: {
                    type: 'login'
                }
            }
        }
    },
    {
        path: '/user/{userId}/logout',
        method: 'GET',
        config: {
            handler: {
                logoutUserHandler: {
                    type: 'logout'
                }
            }
        }
    },
    {
        path: '/user/registration',
        method: 'POST',
        config: {
            handler: {
                registerUserHandler: {
                    type: 'register'
                }
            },
            validate: {
                payload: {
                    username: Joi.string().required().min(3).max(20).regex(/^[a-zA-Z0-9]/),
                    email: Joi.string().required().email(),
                    password: Joi.string().required().min(8).max(20).regex(/^([a-zA-Z0-9@*#]{8,15})$/),
                    firstname: Joi.string().required().min(2).max(20).regex(/^[a-zA-Z0-9]/),
                    surname: Joi.string().required().min(2).max(20).regex(/^[a-zA-Z0-9]/),
                    birthdate: Joi.date().required().iso().format('YYYY-MM-DD').min('1900-01-01').max('2013-12-31'),
                    realm: Joi.string().regex(/^([a-zA-Z0-9@*#\s]{0,15})$/)
                }
            }
        }
    }
];
