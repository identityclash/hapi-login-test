/**
 * Created by Omnius on 6/25/16.
 */
'use strict';

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

    // Invalid paths
    {
        path: '/{path*}',
        method: '*',
        handler: {
            rootHandler: {
                type: 'notfound'
            }
        }
    }
];
