/**
 * Created by Omnius on 6/15/16.
 */
'use strict';

const Boom = require('boom');

exports.register = (server, options, next) => {

    server.auth.strategy('hawk-login-auth-strategy', 'hawk', {
        getCredentialsFunc: (sessionId, callback) => {

            const redis = server.app.redis;
            const methods = server.methods;
            const dao = methods.dao;
            const userCredentialDao = dao.userCredentialDao;

            userCredentialDao.readUserCredential(redis, sessionId, (err, credentials) => {
                if (err) {
                    server.log(err);

                    return callback(Boom.serverUnavailable(err));
                }

                if (!Object.keys(credentials).length) {
                    return callback(Boom.forbidden());
                }

                return callback(null, credentials);
            });
        }
    });

    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};
