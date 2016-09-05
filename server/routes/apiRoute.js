/**
 * Created by Omnius on 6/3/16.
 */
'use strict';

const ErrorPreResponse = require('./preresponse/errorPreResponse');
const HawkPreAuth = require('./preauth/hawkPreAuth');
const Schema = require('./schemas/schema');

const security = {
    xframe: {
        rule: 'sameorigin'
    },
    hsts: {
        maxAge: '31536000',
        includeSubdomains: true
    },
    xss: true
};

module.exports = [
    {
        path: '/user/registration',
        method: 'POST',
        config: {
            cache: {
                expiresIn: 0,
                privacy: 'private'
            },
            handler: {
                registerUserHandler: {
                    type: 'register'
                }
            },
            validate: {
                payload: {
                    username: Schema.username,
                    email: Schema.email,
                    password: Schema.password,
                    firstname: Schema.firstname,
                    surname: Schema.surname,
                    birthdate: Schema.birthdate,
                    realm: Schema.realm
                }
            },
            security
        }
    },
    {
        path: '/user/{userId}/profile',
        method: 'GET',
        config: {
            auth: 'hawk-login-auth-strategy',
            cache: {
                expiresIn: 1 * 1000,
                privacy: 'private'
            },
            ext: {
                onPreAuth: {
                    method: HawkPreAuth
                },
                onPreResponse: {
                    method: ErrorPreResponse
                }
            },
            handler: {
                retrieveUserProfileHandler: {
                    type: 'profile'
                }
            },
            security
        }
    },
    {
        path: '/auth/basic',
        method: 'GET',
        config: {
            auth: {
                mode: 'required',
                strategies: ['basic-login-auth-strategy']
            },
            cache: {
                expiresIn: 0,
                privacy: 'private'
            },
            ext: {
                onPreResponse: {
                    method: ErrorPreResponse
                }
            },
            handler: {
                loginUserHandler: {
                    type: 'login'
                }
            },
            security
        }
    }
];
