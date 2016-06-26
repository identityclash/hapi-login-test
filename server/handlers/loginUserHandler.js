/**
 * Created by Omnius on 6/3/16.
 */
'use strict';

const Boom = require('boom');
const Util = require('util');

module.exports = () => {

    return (request, reply) => {

        const server = request.server;
        const redis = request.redis;
        const dao = server.methods.dao;
        const userDao = dao.userDao;
        const credentials = request.auth.credentials;
        const userId = credentials.userId;

        server.log(Util.inspect(credentials, {showHidden: false, depth: null}));

        let strCredential = '';

        for (const credential in credentials) {
            if (credentials.hasOwnProperty(credential)) {
                strCredential += (credential + '=' + credentials[credential] + ';');
            }
        }

        strCredential = strCredential.slice(0, -1);

        server.log('credentials: ' + JSON.stringify(credentials));

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
                .state('Hawk-Session-Token', credentials)
                .header('Hawk-Session-Token', strCredential)
                .header('Access-Control-Expose-Headers', 'Hawk-Session-Token');
        });
    };
};
