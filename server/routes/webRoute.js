/**
 * Created by Omnius on 6/25/16.
 */
'use strict';

const ErrorPreResponse = require('./preresponse/errorPreResponse');
const HawkPreAuth = require('./preauth/hawkPreAuth');

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
    // Static files
    {
        path: '/html/{path*}',
        method: '*',
        config: {
            cache: {
                privacy: 'public'
            },
            handler: {
                directory: {
                    path: process.cwd() + '/views/html'
                }
            },
            security
        }
    },
    {
        path: '/css/{path*}',
        method: '*',
        config: {
            cache: {
                expiresIn: 30 * 1000,
                privacy: 'public'
            },
            handler: {
                directory: {
                    path: process.cwd() + '/views/css'
                }
            },
            security
        }
    },
    {
        path: '/js/{path*}',
        method: '*',
        config: {
            cache: {
                expiresIn: 30 * 1000,
                privacy: 'public'
            },
            handler: {
                directory: {
                    path: process.cwd() + '/views/js'
                }
            },
            security
        }
    },
    // Web pages
    {
        path: '/login',
        method: 'GET',
        config: {
            cache: {
                expiresIn: 0,
                privacy: 'public'
            },
            handler: {
                webHandler: {
                    type: 'index'
                }
            },
            security
        }
    },
    {
        path: '/error/{statusCode}',
        method: 'GET',
        config: {
            cache: {
                expiresIn: 0,
                privacy: 'public'
            },
            handler: {
                webHandler: {
                    type: 'error'
                }
            },
            security
        }
    },
    {
        path: '/registration',
        method: 'GET',
        config: {
            cache: {
                expiresIn: 30 * 1000,
                privacy: 'public'
            },
            handler: {
                webHandler: {
                    type: 'registration'
                }
            },
            security
        }
    },
    {
        path: '/user/{userId}/welcome',
        method: 'GET',
        config: {
            auth: {
                mode: 'required',
                strategies: ['hawk-login-auth-strategy']
            },
            cache: {
                expiresIn: 0,
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
                welcomeUserHandler: {
                    type: 'profile'
                }
            },
            security
        }
    },
    {
        path: '/user/logout',
        method: 'GET',
        config: {
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
                logoutUserHandler: {
                    type: 'logout'
                }
            },
            security
        }
    }
];
