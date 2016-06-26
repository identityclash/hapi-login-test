/**
 * Created by Omnius on 6/3/16.
 */
'use strict';

const Joi = require('Joi');

module.exports = [
    // {
    //     path: '/user/login/basic',
    //     method: 'POST',
    //     config: {
    //         auth: {
    //             mode: 'required',
    //             strategies: ['basic-login-auth-strategy']
    //         },
    //         handler: {
    //             loginUserHandler: {
    //                 type: 'login'
    //             }
    //         }
    //     }
    // },
    // {
    //     path: '/user/login/custom',
    //     method: 'POST',
    //     config: {
    //         auth: 'custom-login-auth-strategy',
    //         handler: {
    //             loginUserHandler: {
    //                 type: 'login'
    //             }
    //         }
    //     }
    // },
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
    }
];
