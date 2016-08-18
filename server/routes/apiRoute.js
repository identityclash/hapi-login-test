/**
 * Created by Omnius on 6/3/16.
 */
'use strict';

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
            handler: {
                registerUserHandler: {
                    type: 'register'
                }
            },
            cache: {
                expiresIn: 0,
                privacy: 'private'
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
            handler: {
                retrieveUserProfileHandler: {
                    type: 'profile'
                }
            },
            cache: {
                expiresIn: 1 * 1000,
                privacy: 'private'
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
            handler: {
                loginUserHandler: {
                    type: 'login'
                }
            },
            security
        }
    }
];
