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
            handler: {
                directory: {
                    path: process.cwd() + '/views/html'
                }
            },
            cache: {
                privacy: 'public'
            },
            security
        }
    },
    {
        path: '/css/{path*}',
        method: '*',
        config: {
            handler: {
                directory: {
                    path: process.cwd() + '/views/css'
                }
            },
            cache: {
                expiresIn: 30 * 1000,
                privacy: 'public'
            },
            security
        }
    },
    {
        path: '/js/{path*}',
        method: '*',
        config: {
            handler: {
                directory: {
                    path: process.cwd() + '/views/js'
                }
            },
            cache: {
                expiresIn: 30 * 1000,
                privacy: 'public'
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
                expiresIn: 30 * 1000,
                privacy: 'public'
            },
            security
        }
    },
    {
        path: '/registration',
        method: 'GET',
        config: {
            handler: {
                webHandler: {
                    type: 'registration'
                }
            },
            cache: {
                expiresIn: 30 * 1000,
                privacy: 'public'
            },
            security
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
                expiresIn: 0,
                privacy: 'private'
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
            },
            security
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
            },
            cache: {
                expiresIn: 0,
                privacy: 'private'
            },
            security
        }
    }
];
