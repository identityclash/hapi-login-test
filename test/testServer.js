/**
 * Created by Omnius on 18/07/2016.
 */
'use strict';

const Hapi = require('hapi');
const HapiAuthBasic = require('hapi-auth-basic');
const HapiAuthHawk = require('hapi-auth-hawk');
const Inert = require('inert');
// const Redis = require('hapi-ioredis');

module.exports = function () {

    const server = new Hapi.Server();

    server.connection({
        host: '127.0.0.1',
        port: '9001'
    });
    server.register([
        Inert,
        HapiAuthBasic,
        HapiAuthHawk
        // ,
        // {
        //     register: Redis,
        //     options: {
        //         url: 'redis://127.0.0.1:6379'
        //     }
        // }
    ], (err) => {

        if (err) {
            throw err;
        }
    });

    return server;
};
