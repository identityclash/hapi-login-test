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

            userCredentialDao.readUserCredential(redis, sessionId, (err, dbCredentials) => {
                if (err) {
                    server.log(err);

                    return callback(Boom.serverUnavailable(err));
                }

                if (!Object.keys(dbCredentials).length) {
                    return callback(Boom.forbidden());
                }

                const credentials = {
                    hawkSessionToken: dbCredentials.hawkSessionToken,
                    algorithm: dbCredentials.algorithm,
                    userId: dbCredentials.userId,
                    key: dbCredentials.key,
                    id: dbCredentials.id
                };

                return callback(null, credentials);
            });
        },
        hawk: {
            port: ''
        }
    });

    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};
