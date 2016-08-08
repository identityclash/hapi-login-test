/**
 * Created by Omnius on 6/25/16.
 */
'use strict';

const HawkPreAuth = require('./preauth/hawkPreAuth');
const Schema = require('./schemas/schema');

module.exports = [
    // Static files
    {
        path: '/css/{path*}',
        method: '*',
        handler: {
            directory: {
                path: process.cwd() + '/views/css'
            }
        }
    },
    {
        path: '/js/{path*}',
        method: '*',
        handler: {
            directory: {
                path: process.cwd() + '/views/js'
            }
        }
    },
    // Web pages
    {
        path: '/login',
        method: 'GET',
        config: {
            handler: {
                webHandler: {
                    type: 'index'
                }
            }
        }
    },
    {
        path: '/registration',
        method: 'GET',
        handler: {
            webHandler: {
                type: 'registration'
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
                    username: Schema.username,
                    email: Schema.email,
                    password: Schema.password,
                    firstname: Schema.firstname,
                    surname: Schema.surname,
                    birthdate: Schema.birthdate,
                    realm: Schema.realm
                }
            }
        }
    },
    {
        path: '/user/welcome',
        method: 'GET',
        config: {
            auth: {
                mode: 'required',
                strategies: ['hawk-login-auth-strategy']
            },
            cache: {
                expiresIn: 0
            },
            ext: {
                onPreAuth: {
                    method: HawkPreAuth
                }
            },
            handler: {
                welcomeUserHandler: {
                    type: 'profile'
                }
            }
        }
    },
    {
        path: '/user/logout',
        method: 'GET',
        config: {
            handler: {
                logoutUserHandler: {
                    type: 'logout'
                }
            }
        }
    }
];
