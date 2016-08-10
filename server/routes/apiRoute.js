/**
 * Created by Omnius on 6/3/16.
 */
'use strict';

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
