/**
 * Created by Omnius on 6/3/16.
 */
'use strict';

const Boom = require('boom');

module.exports = () => {

    return (request, reply) => {

        const server = request.server;
        const redis = request.redis;
        const dao = server.methods.dao;
        const userDao = dao.userDao;
        const authCredentials = request.auth.credentials;
        const userId = authCredentials.userId;

        const credentials = {
            hawkSessionToken: authCredentials.hawkSessionToken,
            algorithm: authCredentials.algorithm,
            userId: userId
        };

        let strCredential = '';

        for (const credential in credentials) {
            if (credentials.hasOwnProperty(credential)) {
                strCredential += (credential + '=' + credentials[credential] + ';');
            }
        }

        strCredential = strCredential.slice(0, -1);

        userDao.readUsername(redis, userId, (err, username) => {
            if (err) {
                server.log(err);

                return reply(Boom.serverUnavailable(err));
            }

            const details = {
                userId: userId,
                username: username
            };

            return reply
                .view('welcome', details)
                .unstate('Hawk-Session-Token')
                .state('Hawk-Session-Token', credentials)
                .header('Hawk-Session-Token', strCredential)
                .header('Access-Control-Expose-Headers', 'Hawk-Session-Token');
        });
    };
};
