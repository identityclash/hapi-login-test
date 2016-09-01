/**
 * Created by Omnius on 6/18/16.
 */
'use strict';

const Boom = require('boom');

const generateToken = require(process.cwd() + '/server/helpers/hkdfTokenGenerator').generateToken;

module.exports = () => {

    return function (request, reply) {

        const server = request.server;
        const redis = request.redis;
        const dao = server.methods.dao;
        const userProfileDao = dao.userProfileDao;
        const userCredentialDao = dao.userCredentialDao;
        const credentials = request.auth.credentials;
        const userId = credentials.userId;
        const oldSessionId = credentials.id;

        if (request.params.userId !== credentials.userId) {
            return reply(Boom.forbidden().output.payload)
                .code(Boom.forbidden().output.statusCode)
                .header('X-Permitted-Cross-Domain-Policies', 'master-only');
        }

        generateToken(request.info.host + '/hawkSessionToken', null, (newSessionId, newAuthKey, newToken) => {

            userCredentialDao.deleteUserCredential(redis, oldSessionId, (err) => {

                if (err) {
                    server.log(['error', 'database', 'delete'], err);
                }
            });

            userCredentialDao.updateUserCredential(redis, newSessionId, {
                hawkSessionToken: newToken,
                userId: userId,
                id: newSessionId,
                key: newAuthKey,
                algorithm: 'sha256'
            }, (err) => {

                if (err) {
                    server.log(['error', 'database', 'update'], err);
                    return reply(Boom.internal().output.payload)
                        .code(Boom.internal().output.statusCode)
                        .unstate('Hawk-Session-Token')
                        .header('X-Permitted-Cross-Domain-Policies', 'master-only');
                }

                const newCredentials = {
                    hawkSessionToken: newToken,
                    algorithm: 'sha256',
                    userId: userId
                };

                userProfileDao.readUserProfile(redis, userId, (err, userProfile) => {

                    if (err) {
                        server.log(['error', 'database', 'read'], err);
                        return reply(Boom.internal().output.payload)
                            .code(Boom.internal().output.statusCode)
                            .unstate('Hawk-Session-Token')
                            .header('X-Permitted-Cross-Domain-Policies', 'master-only');
                    }

                    return reply(userProfile)
                        .state('Hawk-Session-Token', newCredentials)
                        .header('X-Permitted-Cross-Domain-Policies', 'master-only');
                });
            });
        });
    };
};
