/**
 * Created by Omnius on 18/07/2016.
 */
'use strict';

const Confidence = require('confidence');

const defaultCriteria = {
    env: process.env.NODE_ENV
};

const manifest = {
    server: {
        app: {},
        connections: {
            routes: {
                files: {relativeTo: process.cwd() + '/views'}
            },
            router: {
                isCaseSensitive: false,
                stripTrailingSlash: true
            }
        }
    },
    connections: [
        {
            // $lab:coverage:off$
            port: process.env.PORT || 8088,
            // $lab:coverage:on$
            labels: ['web']
        }
    ],
    registrations: [
        // Templates, views, UI-related
        {plugin: 'inert'},
        {plugin: 'vision'},
        {
            plugin: {
                register: 'visionary',
                options: {
                    path: 'views/layouts',
                    partialsPath: 'views/layouts/partials',
                    engines: {mustache: 'handlebars'}
                }
            }
        },

        // Auuthentication, CSP's, headers, and user-agent-related
        {plugin: 'hapi-auth-basic'},
        {plugin: 'hapi-auth-hawk'},
        {plugin: './auth/basic/basicLoginAuth.js'},
        {plugin: './auth/hawk/hawkAuth.js'},
        {
            plugin: {
                register: 'blankie',
                options: {
                    defaultSrc: 'self',
                    reflectedXss: 'block'
                }
            }
        },
        {
            plugin: {
                register: 'crumb',
                options: {
                    key: 'Crumbz',
                    size: 43,
                    autoGenerate: true,
                    addToViewContext: true,
                    restful: false,
                    cookieOptions: {
                        ttl: 24 * 60 * 60 * 1000,
                        isSecure: true,
                        isHttpOnly: true,
                        path: '/',
                        encoding: 'none',
                        ignoreErrors: true,
                        clearInvalid: true,
                        strictHeader: true
                    }
                }
            }
        },
        {plugin: 'scooter'},

        // Routes, handlers, methods auto-injection-related
        {
            plugin: {
                register: 'acquaint',
                options: {
                    routes: [
                        {
                            includes: ['server/routes/**/*.js'],
                            ignores: [
                                'server/routes/preauth/*.js',
                                'server/routes/preresponse/*.js',
                                'server/routes/schemas/*.js'
                            ]
                        }
                    ],
                    handlers: [
                        {includes: ['server/handlers/**/*.js']}
                    ],
                    methods: [
                        {
                            prefix: 'dao',
                            includes: ['server/methods/dao/*.js']
                        }
                    ]
                }
            }
        },

        // Params, query, and payload-related
        {
            plugin: {
                register: 'disinfect',
                options: {
                    deleteEmpty: true,
                    deleteWhitespace: true,
                    disinfectQuery: true,
                    disinfectParams: true,
                    disinfectPayload: true
                }
            }
        },

        // Cache and database-related
        {
            plugin: {
                register: 'hapi-ioredis',
                options: {
                    url: 'redis://h:pe5gtidosq0dgsbh7ljshfokjuv@ec2-46-137-183-147.eu-west-1.compute.amazonaws.com:8149',
                    password: 'pe5gtidosq0dgsbh7ljshfokjuv'
                    // url: 'redis://127.0.0.1:6379'
                }
            }
        },

        // Logs-related
        {
            plugin: {
                register: 'good',
                options: {
                    ops: {interval: 3600 * 1000},
                    reporters: {
                        console: [
                            {
                                module: 'good-squeeze',
                                name: 'Squeeze',
                                args: [{
                                    ops: '*',
                                    log: '*',
                                    error: '*',
                                    response: '*'
                                }]
                            },
                            {module: 'good-console'},
                            'stdout'
                        ]
                    }
                }
            }
        }
    ]
};

const store = new Confidence.Store(manifest);

exports.get = (key, criteria) => {

    return store.get(key, criteria || defaultCriteria);
};
