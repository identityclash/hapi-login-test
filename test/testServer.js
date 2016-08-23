/**
 * Created by Omnius on 18/07/2016.
 */
'use strict';

const Hapi = require('hapi');
const HapiAuthBasic = require('hapi-auth-basic');
const HapiAuthHawk = require('hapi-auth-hawk');
const Inert = require('inert');
const Handlebars = require('handlebars');
const Vision = require('vision');
const Visionary = require('visionary');


module.exports = function () {

    const server = new Hapi.Server();

    server.connection({
        host: '127.0.0.1',
        port: '9001'
    });

    server.state('Hawk-Session-Token', {
        ttl: 24 * 60 * 60 * 1000,
        path: '/',
        isSecure: false,
        isHttpOnly: false,
        encoding: 'base64json',
        clearInvalid: true
    });

    server.register([
        HapiAuthBasic,
        HapiAuthHawk,
        Inert,
        Vision,
        Visionary
    ], (err) => {

        if (err) {
            throw err;
        }
    });

    server.views({
        path: 'views/layouts',
        partialsPath: 'views/layouts/partials',
        engines: {mustache: Handlebars}
    });

    return server;
};
