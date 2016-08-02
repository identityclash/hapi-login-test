/**
 * Created by Omnius on 6/25/16.
 */
'use strict';

const hawkPreAuth = require('./preauth/hawkPreAuth');
const schema = require('./schemas/schema');

module.exports = [
    {
        // Web login
        path: '/',
        method: '*',
        config: {
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
        // Web welcome page via hawk
        path: '/user/welcomeh',
        method: 'GET',
        config: {
            auth: {
                mode: 'required',
                strategies: ['hawk-login-auth-strategy']
            },
            cache: false,
            ext: {
                onPreAuth: {
                    method: hawkPreAuth
                }
            },
            handler: {
                loginUserHandler: {
                    type: 'login'
                }
            }
        }
    },
    {
        // Web welcome page via basic
        path: '/user/welcomeb',
        method: 'GET',
        config: {
            auth: {
                mode: 'required',
                strategies: ['basic-login-auth-strategy']
            },
            cache: false,
            handler: {
                loginUserHandler: {
                    type: 'login'
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
                    username: schema.username,
                    email: schema.email,
                    password: schema.password,
                    firstname: schema.firstname,
                    surname: schema.surname,
                    birthdate: schema.birthdate,
                    realm: schema.realm
                }
            }
        }
    }
];
