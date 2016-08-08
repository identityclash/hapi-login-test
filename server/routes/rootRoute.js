/**
 * Created by Omnius on 6/25/16.
 */
'use strict';

module.exports = [
    {
        // Web login
        path: '/',
        method: 'GET',
        config: {
            handler: {
                rootHandler: {
                    type: 'index'
                }
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
