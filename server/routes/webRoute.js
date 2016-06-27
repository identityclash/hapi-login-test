/**
 * Created by Omnius on 6/25/16.
 */
'use strict';

const Hawk = require('hawk');
const Joi = require('joi');
const retrieveFromToken = require(process.cwd() + '/server/helpers/hkdfTokenGenerator').retrieveFromToken;

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
                    method: (request, reply) => {

                        const clientToken = request.state['Hawk-Session-Token'];

                        if (!(clientToken && clientToken.hawkSessionToken)) {
                            return reply.continue();
                        }

                        const server = request.server;

                        const ikm = clientToken.hawkSessionToken;
                        const info = request.info.host + '/hawkSessionToken';
                        const salt = '';
                        const length = 2 * 32;

                        server.log(ikm + ' ' + info + ' ' + salt + ' ' + length);

                        retrieveFromToken(ikm, info, salt, length, (id, key) => {
                            if (!(id && key)) {
                                return reply.continue();
                            }

                            const algorithm = clientToken.algorithm;

                            const hawkCredentials = {
                                id: id,
                                key: key,
                                algorithm: algorithm
                            };

                            const url = request.connection.info.protocol
                                + '://'
                                + request.info.host + '/user/welcomeh';

                            request.raw.req.url = url;

                            const header = Hawk.client.header(url,
                                'GET',
                                {credentials: hawkCredentials, ext: 'some-app-data'});

                            request.raw.req.headers.authorization = header.field;

                            return reply.continue();
                        });
                    }
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
                    username: Joi.string().required().min(3).max(20).regex(/^[a-zA-Z0-9]/),
                    email: Joi.string().required().email(),
                    password: Joi.string().required().min(8).max(20).regex(/^([a-zA-Z0-9@*#]{8,15})$/),
                    firstname: Joi.string().required().min(2).max(20).regex(/^[a-zA-Z0-9]/),
                    surname: Joi.string().required().min(2).max(20).regex(/^[a-zA-Z0-9]/),
                    birthdate: Joi.date().required().iso().format('YYYY-MM-DD').min('1900-01-01').max('2013-12-31'),
                    realm: Joi.string().regex(/^([a-zA-Z0-9@*#\s]{0,15})$/)
                }
            }
        }
    }
];
