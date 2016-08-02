/**
 * Created by Omnius on 18/07/2016.
 */
'use strict';

const Hapi = require('hapi');
const HapiAuthBasic = require('hapi-auth-basic');
const Inert = require('inert');
// const Redis = require('hapi-ioredis');

module.exports = function () {

    const server = new Hapi.Server();

    server.connection();
    server.register([
        Inert,
        HapiAuthBasic
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
