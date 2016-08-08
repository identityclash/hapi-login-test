/**
 * Created by Omnius on 6/3/16.
 */
'use strict';

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
            }
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
                privacy: 'private',
                expiresIn: 0
            },
            handler: {
                loginUserHandler: {
                    type: 'login'
                }
            }
        }
    }
];
