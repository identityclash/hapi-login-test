/**
 * Created by Omnius on 6/25/16.
 */
'use strict';

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
            handler: {
                webHandler: {
                    type: 'index'
                }
            },
            cache: {
                expiresIn: 0,
                privacy: 'public'
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
            ext: {
                onPreAuth: {
                    method: HawkPreAuth
                }
            },
            auth: {
                mode: 'required',
                strategies: ['hawk-login-auth-strategy']
            },
            cache: {
                expiresIn: 0,
                privacy: 'private'
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
            handler: {
                logoutUserHandler: {
                    type: 'logout'
                }
            },
            security
        }
    }
];
