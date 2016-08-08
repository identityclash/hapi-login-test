/**
 * Created by Omnius on 03/08/2016.
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

        userDao.readUsername(redis, userId, (err, username) => {
            if (err) {
                server.log(err);

                return reply(Boom.internal(err));
            }

            const details = {
                userId: userId,
                username: username
            };

            return reply.view('welcome', details)
                .state('Hawk-Session-Token', credentials)
                .header('Cache-Control', 'no-cache, no-store, must-revalidate');
        });
    };
};
