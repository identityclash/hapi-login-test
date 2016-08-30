/**
 * Created by Omnius on 6/25/16.
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
        // Web login
        path: '/',
        method: 'GET',
        config: {
            cache: {
                privacy: 'public'
            },
            handler: {
                rootHandler: {
                    type: 'index'
                }
            },
            security
        }
    },
    // Invalid paths
    {
        path: '/{path*}',
        method: '*',
        config: {
            cache: {
                privacy: 'public'
            },
            handler: {
                rootHandler: {
                    type: 'notfound'
                }
            },
            security
        }
    }
];
