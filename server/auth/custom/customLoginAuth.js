/**
 * Created by Omnius on 6/5/16.
 */
'use strict';

const Bcrypt = require('Bcryptjs');
const Boom = require('boom');

function compareHash(username, request, reply) {

    const redis = request.redis;
    const server = request.server;
    const methods = server.methods;

    methods.dao.userDao.readUserHashAndRealm(redis, username, (err, dbHashAndRealm) => {
        if (err) {
            return reply(err);
        }

        if (dbHashAndRealm.length === 0 || dbHashAndRealm[0] === null) {
            return reply(Boom.unauthorized('Bad username or password'));
        }

        const headers = request.raw.req.headers;
        const clientPw = headers.password;
        const dbHashedPw = dbHashAndRealm[0];

        Bcrypt.compare(clientPw, dbHashedPw, (err, result) => {
            if (err) {
                return reply(err);
            }

            if (result) {
                return reply('hello');
            }

            return reply(Boom.unauthorized('Bad username or password'));
        });
    });
}

const scheme = function () {

    return {
        authenticate: function (request, reply) {

            const headers = request.raw.req.headers;
            const username = headers.username;
            const password = headers.password;

            if (!(username && password)) {
                return reply(Boom.unauthorized('Bad username or password'));
            }

            const isEmail = username.indexOf('@') > -1;
            const redis = request.redis;
            const server = request.server;
            const methods = server.methods;

            if (isEmail) {
                methods.dao.userDao.readUsername(redis, username, (err, dbUsername) => {
                    if (err) {
                        return reply(err);
                    }

                    if (!dbUsername) {
                        return reply(Boom.unauthorized('Bad username or password'));
                    }

                    compareHash(dbUsername, request, reply);
                });
            }

            compareHash(username, request, reply);
        }
    };
};

exports.register = (server, options, next) => {

    server.auth.scheme('custom-login-auth-scheme', scheme);
    server.auth.strategy('custom-login-auth-strategy', 'custom-login-auth-scheme');

    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};
